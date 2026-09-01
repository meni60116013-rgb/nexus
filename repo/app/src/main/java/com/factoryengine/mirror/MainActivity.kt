package com.vcore.vectorforge

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.*
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.*

import com.vcore.vectorforge.ui.CreatorScreen
import com.vcore.vectorforge.ui.DashboardScreen
import com.vcore.vectorforge.ui.BuildScreen
import com.vcore.vectorforge.ui.SettingsScreen

class MainActivity : ComponentActivity() {

    private val vm: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme()
            ) {
                val navController = rememberNavController()
                val backStack by navController.currentBackStackEntryAsState()
                val route = backStack?.destination?.route ?: "dashboard"

                Scaffold(
                    bottomBar = {
                        NavigationBar {
                            NavigationBarItem(
                                selected = route == "dashboard",
                                onClick = { navController.navigate("dashboard") },
                                icon = { Icon(Icons.Default.Dashboard, null) },
                                label = { Text("Núcleo") }
                            )

                            NavigationBarItem(
                                selected = route == "creator",
                                onClick = { navController.navigate("creator") },
                                icon = { Icon(Icons.Default.Tune, null) },
                                label = { Text("Creator") }
                            )

                            NavigationBarItem(
                                selected = route == "build",
                                onClick = { navController.navigate("build") },
                                icon = { Icon(Icons.Default.Build, null) },
                                label = { Text("Build") }
                            )

                            NavigationBarItem(
                                selected = route == "settings",
                                onClick = { navController.navigate("settings") },
                                icon = { Icon(Icons.Default.Settings, null) },
                                label = { Text("Config") }
                            )
                        }
                    }
                ) { padding ->

                    NavHost(
                        navController = navController,
                        startDestination = "dashboard",
                        modifier = Modifier.padding(padding)
                    ) {
                        composable("dashboard") {
                            DashboardScreen(vm)
                        }

                        composable("creator") {
                            CreatorScreen(vm) {
                                vm.generateProject()
                                navController.navigate("build")
                            }
                        }

                        composable("build") {
                            BuildScreen(vm)
                        }

                        composable("settings") {
                            SettingsScreen(vm)
                        }
                    }
                }
            }
        }
    }
}
