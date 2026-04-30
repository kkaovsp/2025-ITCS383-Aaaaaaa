package com.kkaovsp.boothorganizer.util

import java.util.Locale
import java.util.regex.Pattern

/**
 * Pure Kotlin utility functions extracted from MainActivity for testability.
 * All functions are stateless and have no Android Context dependency
 * (Color constants are passed as parameters where needed).
 */
object AndroidUtils {

    // ─── Color helpers ──────────────────────────────────────────────────────────

    // Pure integer ARGB bit-manipulation equivalents of android.graphics.Color methods.
    // Produces identical results to Color.red(color)/Color.green(color)/Color.blue(color)/Color.rgb()
    // but works in both Android runtime and plain JVM unit tests.

    private fun colorRed(color: Int): Int = (color shr 16) and 0xFF
    private fun colorGreen(color: Int): Int = (color shr 8) and 0xFF
    private fun colorBlue(color: Int): Int = color and 0xFF
    private fun colorRgb(r: Int, g: Int, b: Int): Int = (0xFF shl 24) or (r shl 16) or (g shl 8) or b

    fun lighten(color: Int): Int {
        val r = colorRed(color)
        val g = colorGreen(color)
        val b = colorBlue(color)
        return colorRgb((r + (255 - r) * 0.86).toInt(), (g + (255 - g) * 0.86).toInt(), (b + (255 - b) * 0.86).toInt())
    }

    fun darken(color: Int): Int {
        val r = colorRed(color)
        val g = colorGreen(color)
        val b = colorBlue(color)
        return colorRgb((r * 0.75).toInt(), (g * 0.75).toInt(), (b * 0.75).toInt())
    }

    // ─── Status color mapping ──────────────────────────────────────────────────

    fun reservationColor(status: String): Int {
        return when (status) {
            "PENDING_PAYMENT" -> 0xFFF59E0B.toInt()
            "WAITING_FOR_APPROVAL" -> 0xFF06B6D4.toInt()
            "CONFIRMED" -> 0xFF10B981.toInt()
            "CANCELLED" -> 0xFFEF4444.toInt()
            else -> 0xFF94A3B8.toInt()
        }
    }

    fun paymentColor(status: String): Int {
        return when (status) {
            "APPROVED" -> 0xFF10B981.toInt()
            "PENDING" -> 0xFFF59E0B.toInt()
            "REJECTED" -> 0xFFEF4444.toInt()
            else -> 0xFF94A3B8.toInt()
        }
    }

    fun approvalColor(status: String): Int {
        return when (status) {
            "APPROVED" -> 0xFF10B981.toInt()
            "REJECTED" -> 0xFFEF4444.toInt()
            "PENDING" -> 0xFFF59E0B.toInt()
            else -> 0xFF94A3B8.toInt()
        }
    }

    // ─── Event status ──────────────────────────────────────────────────────────

    fun eventStatus(startDate: String, endDate: String): String {
        return try {
            val today = java.time.LocalDate.now()
            val start = java.time.LocalDate.parse(startDate)
            val end = java.time.LocalDate.parse(endDate)
            when {
                today.isBefore(start) -> "upcoming"
                today.isAfter(end) -> "ended"
                else -> "ongoing"
            }
        } catch (_: Exception) {
            "upcoming"
        }
    }

    fun eventStatusColor(status: String): Int {
        return when (status) {
            "ongoing" -> 0xFF06B6D4.toInt()
            "ended" -> 0xFF94A3B8.toInt()
            else -> 0xFF06B6D4.toInt()
        }
    }

    // ─── File name sanitisation ────────────────────────────────────────────────

    private val NON_ALPHANUMERIC_REGEX = Pattern.compile("[^a-z0-9ก-๙]+")

    fun safeFileName(value: String): String {
        return NON_ALPHANUMERIC_REGEX
            .matcher(value.lowercase(Locale.US))
            .replaceAll("_")
            .trim('_')
            .ifBlank { "event" }
    }

    // ─── MIME detection ───────────────────────────────────────────────────────

    /**
     * Detect MIME type from raw bytes using magic numbers.
     * Returns a pair of (mimeType, suggestedFileExtension).
     */
    fun detectMimeFromBytes(bytes: ByteArray): Pair<String, String> {
        return when {
            bytes.size >= 4 && bytes[0] == 0x89.toByte() && bytes[1] == 0x50.toByte() -> "image/png" to "png"
            bytes.size >= 4 && bytes[0] == 0xFF.toByte() && bytes[1] == 0xD8.toByte() -> "image/jpeg" to "jpg"
            bytes.size >= 4 && bytes[0] == 0x25.toByte() && bytes[1] == 0x50.toByte() -> "application/pdf" to "pdf"
            bytes.size >= 4 && bytes[0] == 0x47.toByte() && bytes[1] == 0x49.toByte() -> "image/gif" to "gif"
            bytes.size >= 4 && bytes[0] == 0x52.toByte() && bytes[1] == 0x49.toByte() && bytes[2] == 0x46.toByte() && bytes[3] == 0x46.toByte() -> "image/webp" to "webp"
            else -> "application/octet-stream" to "bin"
        }
    }

    /**
     * Detect MIME type from filename extension.
     */
    fun mimeFromExtension(fileName: String): String {
        return when {
            fileName.endsWith(".png", ignoreCase = true) -> "image/png"
            fileName.endsWith(".jpg", ignoreCase = true) || fileName.endsWith(".jpeg", ignoreCase = true) -> "image/jpeg"
            fileName.endsWith(".gif", ignoreCase = true) -> "image/gif"
            fileName.endsWith(".webp", ignoreCase = true) -> "image/webp"
            fileName.endsWith(".pdf", ignoreCase = true) -> "application/pdf"
            else -> "application/octet-stream"
        }
    }

    // ─── Currency formatting ───────────────────────────────────────────────────

    private val thCurrencyFormat = java.text.NumberFormat.getCurrencyInstance(Locale("th", "TH"))

    fun formatMoneyTh(value: Double): String = thCurrencyFormat.format(value)

    // ─── Role helpers ──────────────────────────────────────────────────────────

    fun isManager(role: String): Boolean = role == "BOOTH_MANAGER"

    fun isMerchant(role: String): Boolean = role == "MERCHANT"

    fun isGeneralUser(role: String): Boolean = role == "GENERAL_USER"

    // ─── Reservation / Payment status helpers ─────────────────────────────────

    fun isPending(status: String): Boolean = status == "PENDING"

    fun isApproved(status: String): Boolean = status == "APPROVED"

    fun isRejected(status: String): Boolean = status == "REJECTED"

    fun isConfirmedReservation(status: String): Boolean = status == "CONFIRMED"

    fun isCancellable(status: String): Boolean = status == "PENDING_PAYMENT" || status == "WAITING_FOR_APPROVAL"

    // ─── Spinner selection helper ─────────────────────────────────────────────

    /**
     * Given a list of (value, label) pairs and the selected value,
     * returns the selected value or empty string if not found.
     * This mimics the Spinner.selectedValue() extension in MainActivity.
     */
    fun <T> selectedSpinnerValue(options: List<Pair<T, String>>, selectedIndex: Int): T? {
        return options.getOrNull(selectedIndex)?.first ?: options.firstOrNull()?.first
    }

    // ─── Boolean-like JSON parsing ─────────────────────────────────────────────

    /**
     * Parse a boolean value from a JSON-like map, handling booleans, numbers, and strings.
     */
    fun parseBooleanLike(value: Any?): Boolean {
        return when (value) {
            is Boolean -> value
            is Number -> value.toInt() != 0
            is String -> value == "true" || value == "1"
            else -> false
        }
    }
}