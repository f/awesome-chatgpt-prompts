package com.example.imagematcher.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.imagematcher.ui.screens.settings.SettingsScreen
import com.example.imagematcher.ui.screens.workbench.WorkbenchScreen

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = "workbench"
    ) {
        composable("workbench") {
            WorkbenchScreen(navController = navController)
        }
        composable("settings") {
            SettingsScreen(navController = navController)
        }
    }
}
