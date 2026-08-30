package com.factoryengine.mirror

import android.app.Application
import android.content.Intent
import androidx.core.content.FileProvider
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.factoryengine.mirror.data.TokenStore
import com.factoryengine.mirror.network.CreateRepoFromTemplate
import com.factoryengine.mirror.network.RetrofitClient
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.io.File
import java.util.zip.ZipInputStream

const val GH_USER = "meni60116013-rgb"
const val TEMPLATE = "factory-engine-suite"

enum class BuildPhase { IDLE, CREATING_REPO, WAITING_BUILD, HEALING, SUCCESS, FAILED }

data class UiState(
    val idea: String = "",
    val repoName: String = "",
    val phase: BuildPhase = BuildPhase.IDLE,
    val message: String = "Listo",
    val apkPath: String? = null,
    val issueBody: String? = null
)

class MainViewModel(app: Application) : AndroidViewModel(app) {
    private val tokenStore = TokenStore(app)
    private val api by lazy { RetrofitClient.create(tokenStore) }

    private val _state = MutableStateFlow(UiState())
    val state: StateFlow<UiState> = _state

    fun hasToken() = tokenStore.hasToken()
    fun saveToken(token: String) = tokenStore.saveToken(token)

    fun updateIdea(text: String) { _state.value = _state.value.copy(idea = text) }

    fun generateProject() {
        val slug = "app-" + System.currentTimeMillis()
        _state.value = _state.value.copy(phase = BuildPhase.CREATING_REPO, repoName = slug, message = "Creando repo desde plantilla...")
        viewModelScope.launch {
            try {
                api.createFromTemplate(GH_USER, TEMPLATE, CreateRepoFromTemplate(GH_USER, slug))
                _state.value = _state.value.copy(phase = BuildPhase.WAITING_BUILD, message = "Repo creado. Esperando que arranque el build...")
                pollBuild(slug)
            } catch (e: Exception) {
                _state.value = _state.value.copy(phase = BuildPhase.FAILED, message = "Error creando repo: ${e.message}")
            }
        }
    }

    private suspend fun pollBuild(repo: String) {
        delay(10000)
        repeat(30) {
            try {
                val runs = api.getRuns(GH_USER, repo)
                val run = runs.workflow_runs.firstOrNull()
                if (run == null) { delay(8000); return@repeat }
                when (run.status) {
                    "completed" -> {
                        if (run.conclusion == "success") {
                            _state.value = _state.value.copy(phase = BuildPhase.SUCCESS, message = "Build exitoso. Buscando APK...")
                            downloadApk(repo, run.id)
                        } else {
                            _state.value = _state.value.copy(phase = BuildPhase.HEALING, message = "Build fallo. Self-Healing intentando reparar...")
                            delay(60000)
                            val issues = try { api.getIssues(GH_USER, repo) } catch (e: Exception) { emptyList() }
                            if (issues.isNotEmpty()) {
                                _state.value = _state.value.copy(phase = BuildPhase.FAILED, message = "No se pudo reparar automaticamente.", issueBody = issues.first().body)
                            } else {
                                pollBuild(repo)
                            }
                        }
                        return
                    }
                    else -> {
                        _state.value = _state.value.copy(message = "Compilando... (${run.status})")
                        delay(8000)
                    }
                }
            } catch (e: Exception) { delay(8000) }
        }
    }

    private suspend fun downloadApk(repo: String, runId: Long) {
        try {
            val artifacts = api.getArtifacts(GH_USER, repo, runId)
            val apkArtifact = artifacts.artifacts.firstOrNull { it.name.contains("apk") }
            if (apkArtifact == null) {
                _state.value = _state.value.copy(message = "Build exitoso pero no se encontro artifact APK.")
                return
            }
            val resp = api.downloadArtifact(apkArtifact.archive_download_url)
            val ctx = getApplication<Application>()
            val dir = File(ctx.getExternalFilesDir(null), "downloads").apply { mkdirs() }
            val zipFile = File(dir, "artifact.zip")
            resp.body()?.byteStream()?.use { input ->
                zipFile.outputStream().use { output -> input.copyTo(output) }
            }
            var apkFile: File? = null
            ZipInputStream(zipFile.inputStream()).use { zis ->
                var entry = zis.nextEntry
                while (entry != null) {
                    if (entry.name.endsWith(".apk")) {
                        val outFile = File(dir, entry.name)
                        outFile.outputStream().use { zis.copyTo(it) }
                        apkFile = outFile
                    }
                    entry = zis.nextEntry
                }
            }
            _state.value = _state.value.copy(apkPath = apkFile?.absolutePath, message = "APK listo para instalar.")
        } catch (e: Exception) {
            _state.value = _state.value.copy(message = "Error descargando APK: ${e.message}")
        }
    }

    fun installApk() {
        val path = _state.value.apkPath ?: return
        val ctx = getApplication<Application>()
        val file = File(path)
        val uri = FileProvider.getUriForFile(ctx, "com.factoryengine.mirror.fileprovider", file)
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        ctx.startActivity(intent)
    }
}
