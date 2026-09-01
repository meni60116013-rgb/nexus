package com.vcore.vectorforge.network

import com.vcore.vectorforge.data.TokenStore
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    fun create(tokenStore: TokenStore): GitHubApi {
        val authInterceptor = Interceptor { chain ->
            val token = tokenStore.getToken() ?: ""
            val request = chain.request().newBuilder()
                .addHeader("Authorization", "token $token")
                .addHeader("Accept", "application/vnd.github+json")
                .build()
            chain.proceed(request)
        }
        val client = OkHttpClient.Builder().addInterceptor(authInterceptor).build()
        return Retrofit.Builder()
            .baseUrl("https://api.github.com/")
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(GitHubApi::class.java)
    }
}
