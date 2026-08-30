package com.vcore.grid.suite.security

import java.security.MessageDigest

object IntegrityGuard {
    private const val AUTHOR_SHA256 = "64A7E08F87B413550C8354DDFD48C2B32857D0D263B9BA63C70D1D23A7FFC9F1"
    private const val EXPECTED_AUTHOR = "Manuel de Jesús Ovalle Carrillo"

    fun verifySystemIntegrity(signaturePayload: String): Boolean {
        val calculatedHash = sha256(signaturePayload)
        if (!calculatedHash.equals(AUTHOR_SHA256, ignoreCase = true)) {
            throw SecurityException("INTEGRITY_FAILURE: Invalid authorship signature.")
        }
        return true
    }

    private fun sha256(input: String): String {
        val bytes = MessageDigest.getInstance("SHA-256").digest(input.toByteArray())
        return bytes.joinToString("") { "%02x".format(it) }
    }

    fun getDeclaredAuthor(): String = EXPECTED_AUTHOR
}
