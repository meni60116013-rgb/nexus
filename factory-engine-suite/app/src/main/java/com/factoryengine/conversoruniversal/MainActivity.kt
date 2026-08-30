package com.factoryengine.conversoruniversal

import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val layout = LinearLayout(this)
        layout.orientation = LinearLayout.VERTICAL
        layout.setPadding(40, 100, 40, 40)

        val input = EditText(this)
        input.hint = "Metros"

        val result = TextView(this)
        result.textSize = 18f

        val button = Button(this)
        button.text = "Convertir a pies"
        button.setOnClickListener {
            val metros = input.text.toString().toDoubleOrNull() ?: 0.0
            val pies = metros * 3.28084
            result.text = "%.2f metros = %.2f pies".format(metros, pies)
        }

        layout.addView(input)
        layout.addView(button)
        layout.addView(result)
        setContentView(layout)
    }
}
