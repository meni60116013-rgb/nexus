package com.factoryengine.mirror.network

import retrofit2.Response
import retrofit2.http.*
import okhttp3.ResponseBody

data class CreateRepoFromTemplate(val owner: String, val name: String, val private: Boolean = true)
data class WorkflowRunsResponse(val workflow_runs: List<WorkflowRun>)
data class WorkflowRun(val id: Long, val status: String, val conclusion: String?, val html_url: String)
data class Artifact(val id: Long, val name: String, val archive_download_url: String)
data class ArtifactsResponse(val artifacts: List<Artifact>)
data class GhIssue(val title: String, val body: String?)

interface GitHubApi {
    @POST("repos/{owner}/{template}/generate")
    suspend fun createFromTemplate(
        @Path("owner") owner: String,
        @Path("template") template: String,
        @Body body: CreateRepoFromTemplate
    ): Response<Unit>

    @GET("repos/{owner}/{repo}/actions/runs")
    suspend fun getRuns(@Path("owner") owner: String, @Path("repo") repo: String): WorkflowRunsResponse

    @GET("repos/{owner}/{repo}/actions/runs/{run_id}/artifacts")
    suspend fun getArtifacts(@Path("owner") owner: String, @Path("repo") repo: String, @Path("run_id") runId: Long): ArtifactsResponse

    @GET("repos/{owner}/{repo}/issues")
    suspend fun getIssues(@Path("owner") owner: String, @Path("repo") repo: String): List<GhIssue>

    @Streaming
    @GET
    suspend fun downloadArtifact(@Url url: String): Response<ResponseBody>
}
