package com.factoryengine.mirror.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.factoryengine.mirror.BuildPhase
import com.factoryengine.mirror.MainViewModel

@Composable
fun HomeScreen(vm: MainViewModel, onGenerate: () -> Unit) {
    val state by vm.state.collectAsState()
    Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Factory Engine Mirror", style = MaterialTheme.typography.headlineMedium)
        Text("Describe tu idea y el motor la compila en la nube.", style = MaterialTheme.typography.bodyMedium)
        OutlinedTextField(
            value = state.idea, onValueChange = { vm.updateIdea(it) },
            label = { Text("Idea de la app") }, modifier = Modifier.fillMaxWidth(), minLines = 3
        )
        Button(
            onClick = { vm.generateProject(); onGenerate() },
            enabled = state.idea.isNotBlank() && state.phase == BuildPhase.IDLE,
            modifier = Modifier.fillMaxWidth()
        ) { Text("Generar proyecto") }
    }
}

@Composable
fun StatusScreen(vm: MainViewModel) {
    val state by vm.state.collectAsState()
    Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
        Text("Estado del build", style = MaterialTheme.typography.headlineSmall)
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            when (state.phase) {
                BuildPhase.SUCCESS -> Icon(Icons.Filled.CheckCircle, null)
                BuildPhase.FAILED -> Icon(Icons.Filled.Error, null)
                BuildPhase.IDLE -> Icon(Icons.Filled.HourglassEmpty, null)
                else -> CircularProgressIndicator(modifier = Modifier.size(24.dp))
            }
            Text(state.message, style = MaterialTheme.typography.bodyLarge)
        }
        if (state.repoName.isNotBlank()) Text("Repo: ${state.repoName}", style = MaterialTheme.typography.bodySmall)
        state.apkPath?.let {
            Button(onClick = { vm.installApk() }, modifier = Modifier.fillMaxWidth()) { Text("Instalar APK") }
        }
        state.issueBody?.let {
            Text("Diagnostico:", style = MaterialTheme.typography.titleSmall)
            Text(it, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
fun SettingsScreen(vm: MainViewModel) {
    var token by remember { mutableStateOf("") }
    var saved by remember { mutableStateOf(vm.hasToken()) }
    Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Configuracion", style = MaterialTheme.typography.headlineSmall)
        Text(if (saved) "Token guardado de forma segura." else "Pega tu GitHub Personal Access Token (scope repo).", style = MaterialTheme.typography.bodyMedium)
        OutlinedTextField(value = token, onValueChange = { token = it }, label = { Text("GitHub Token") }, modifier = Modifier.fillMaxWidth())
        Button(onClick = { vm.saveToken(token); saved = true; token = "" }, modifier = Modifier.fillMaxWidth()) { Text("Guardar token") }
    }
}
