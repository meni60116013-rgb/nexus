package com.factoryengine.mirror

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.foundation.layout.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.factoryengine.mirror.ui.HomeScreen
import com.factoryengine.mirror.ui.SettingsScreen
import com.factoryengine.mirror.ui.StatusScreen

class MainActivity : ComponentActivity() {
    private val vm: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface(modifier = Modifier.fillMaxSize()) {
                    val navController = rememberNavController()
                    val backStack by navController.currentBackStackEntryAsState()
                    val currentRoute = backStack?.destination?.route ?: "home"

                    Scaffold(bottomBar = {
                        NavigationBar {
                            NavigationBarItem(selected = currentRoute == "home", onClick = { navController.navigate("home") },
                                icon = { Icon(Icons.Filled.Home, null) }, label = { Text("Inicio") })
                            NavigationBarItem(selected = currentRoute == "status", onClick = { navController.navigate("status") },
                                icon = { Icon(Icons.Filled.Build, null) }, label = { Text("Estado") })
                            NavigationBarItem(selected = currentRoute == "settings", onClick = { navController.navigate("settings") },
                                icon = { Icon(Icons.Filled.Settings, null) }, label = { Text("Config") })
                        }
                    }) { padding ->
                        NavHost(navController, startDestination = "home", modifier = Modifier.padding(padding)) {
                            composable("home") { HomeScreen(vm) { navController.navigate("status") } }
                            composable("status") { StatusScreen(vm) }
                            composable("settings") { SettingsScreen(vm) }
                        }
                    }
                }
            }
        }
    }
}
