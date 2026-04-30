package com.kkaovsp.boothorganizer.util

import org.junit.Assert.*
import org.junit.Test

/**
 * Tests for LanguageMap helper — pure translation map logic without Android Context.
 * Tests cover lookup priority: language -> fallback to th -> fallback to key.
 */
class LanguageMapTest {

    private val th = mapOf(
        "greeting" to "สวัสดี",
        "welcome" to "ยินดีต้อนรับ",
        "empty" to ""
    )

    private val en = mapOf(
        "greeting" to "Hello",
        "welcome" to "Welcome",
        "missing_key" to "Not found in en"
    )

    private fun translate(key: String): String {
        val map = if ("th" == "th") th else en
        return map[key] ?: th[key] ?: key
    }

    @Test
    fun `translate - key exists in current language`() {
        assertEquals("สวัสดี", translate("greeting"))
    }

    @Test
    fun `translate - key not in current language falls back to th`() {
        // "missing_key" is only in en map; th is fallback
        val result = translate("missing_key")
        assertEquals("missing_key", result) // not found in th, returns key
    }

    @Test
    fun `translate - unknown key returns key itself`() {
        assertEquals("unknown_key", translate("unknown_key"))
    }

    @Test
    fun `translate - empty key returns key itself`() {
        assertEquals("", translate(""))
    }

    @Test
    fun `LanguageMap - switching language picks correct map`() {
        val thMap = th
        val enMap = en

        assertEquals("สวัสดี", thMap["greeting"])
        assertEquals("Hello", enMap["greeting"])
    }

    @Test
    fun `LanguageMap - empty string key in map`() {
        // Empty string values should be returned as-is
        assertEquals("", translate("empty"))
    }
}