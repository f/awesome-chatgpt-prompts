package com.example.imagematcher

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.imagematcher.ui.navigation.AppNavigation
import com.example.imagematcher.ui.theme.ImageMatcherTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ImageMatcherTheme {
                AppNavigation()
            }
        }
    }
}
