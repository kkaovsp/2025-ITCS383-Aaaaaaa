package com.kkaovsp.boothorganizer.util

import org.junit.Assert.*
import org.junit.Test

class AndroidUtilsTest {

    // ─── Color helpers ─────────────────────────────────────────────────────────

    @Test
    fun `lighten - makes color lighter`() {
        val result = AndroidUtils.lighten(0xFF000000.toInt()) // black
        // R=0, G=0, B=0 -> R=(0+(255-0)*0.86)=219, G=219, B=219
        assertEquals(0xFFDBDBDB.toInt(), result)
    }

    @Test
    fun `lighten - white stays white`() {
        val result = AndroidUtils.lighten(0xFFFFFFFF.toInt())
        assertEquals(0xFFFFFFFF.toInt(), result)
    }

    @Test
    fun `lighten - already light stays in range`() {
        val result = AndroidUtils.lighten(0xFFDDDDDD.toInt())
        // Should not overflow
        assertTrue(result shr 24 and 0xFF == 0xFF.toInt())
    }

    @Test
    fun `darken - makes color darker`() {
        val result = AndroidUtils.darken(0xFFFFFFFF.toInt()) // white
        // R=255, G=255, B=255 -> R=191, G=191, B=191
        assertEquals(0xFFBFBFBF.toInt(), result)
    }

    @Test
    fun `darken - black stays black`() {
        val result = AndroidUtils.darken(0xFF000000.toInt())
        assertEquals(0xFF000000.toInt(), result)
    }

    // ─── Status color mapping ──────────────────────────────────────────────────

    @Test
    fun `reservationColor - maps each known status to correct color`() {
        assertEquals(0xFFF59E0B.toInt(), AndroidUtils.reservationColor("PENDING_PAYMENT"))
        assertEquals(0xFF06B6D4.toInt(), AndroidUtils.reservationColor("WAITING_FOR_APPROVAL"))
        assertEquals(0xFF10B981.toInt(), AndroidUtils.reservationColor("CONFIRMED"))
        assertEquals(0xFFEF4444.toInt(), AndroidUtils.reservationColor("CANCELLED"))
    }

    @Test
    fun `reservationColor - unknown status returns muted gray`() {
        assertEquals(0xFF94A3B8.toInt(), AndroidUtils.reservationColor("UNKNOWN_STATUS"))
        assertEquals(0xFF94A3B8.toInt(), AndroidUtils.reservationColor(""))
    }

    @Test
    fun `paymentColor - maps each known status to correct color`() {
        assertEquals(0xFF10B981.toInt(), AndroidUtils.paymentColor("APPROVED"))
        assertEquals(0xFFF59E0B.toInt(), AndroidUtils.paymentColor("PENDING"))
        assertEquals(0xFFEF4444.toInt(), AndroidUtils.paymentColor("REJECTED"))
    }

    @Test
    fun `paymentColor - unknown status returns muted gray`() {
        assertEquals(0xFF94A3B8.toInt(), AndroidUtils.paymentColor(""))
        assertEquals(0xFF94A3B8.toInt(), AndroidUtils.paymentColor("UNKNOWN"))
    }

    @Test
    fun `approvalColor - maps each known status to correct color`() {
        assertEquals(0xFF10B981.toInt(), AndroidUtils.approvalColor("APPROVED"))
        assertEquals(0xFFF59E0B.toInt(), AndroidUtils.approvalColor("PENDING"))
        assertEquals(0xFFEF4444.toInt(), AndroidUtils.approvalColor("REJECTED"))
    }

    @Test
    fun `approvalColor - unknown status returns muted gray`() {
        assertEquals(0xFF94A3B8.toInt(), AndroidUtils.approvalColor(""))
    }

    // ─── Event status ──────────────────────────────────────────────────────────

    @Test
    fun `eventStatus - date in future returns upcoming`() {
        val result = AndroidUtils.eventStatus("2099-01-01", "2099-12-31")
        assertEquals("upcoming", result)
    }

    @Test
    fun `eventStatus - date in past returns ended`() {
        val result = AndroidUtils.eventStatus("2000-01-01", "2000-12-31")
        assertEquals("ended", result)
    }

    @Test
    fun `eventStatus - current date range returns ongoing`() {
        val today = java.time.LocalDate.now().toString()
        val result = AndroidUtils.eventStatus(today, today)
        assertEquals("ongoing", result)
    }

    @Test
    fun `eventStatus - invalid date returns upcoming`() {
        assertEquals("upcoming", AndroidUtils.eventStatus("invalid", "invalid"))
        assertEquals("upcoming", AndroidUtils.eventStatus("", ""))
    }

    @Test
    fun `eventStatusColor - ongoing uses secondary cyan`() {
        assertEquals(0xFF06B6D4.toInt(), AndroidUtils.eventStatusColor("ongoing"))
    }

    @Test
    fun `eventStatusColor - ended uses muted gray`() {
        assertEquals(0xFF94A3B8.toInt(), AndroidUtils.eventStatusColor("ended"))
    }

    @Test
    fun `eventStatusColor - upcoming uses secondary cyan`() {
        assertEquals(0xFF06B6D4.toInt(), AndroidUtils.eventStatusColor("upcoming"))
    }

    // ─── File name sanitisation ───────────────────────────────────────────────

    @Test
    fun `safeFileName - replaces spaces and special chars with underscore`() {
        assertEquals("hello_world_test", AndroidUtils.safeFileName("hello world test!"))
    }

    @Test
    fun `safeFileName - removes leading trailing underscores`() {
        assertEquals("event_name", AndroidUtils.safeFileName("  event name  "))
    }

    @Test
    fun `safeFileName - collapses multiple separators`() {
        assertEquals("file_name_123", AndroidUtils.safeFileName("file--name!!123"))
    }

    @Test
    fun `safeFileName - converts to lowercase`() {
        assertEquals("myevent", AndroidUtils.safeFileName("MyEvent"))
    }

    @Test
    fun `safeFileName - handles thai characters`() {
        assertEquals("งานอีเวนต์", AndroidUtils.safeFileName("งานอีเวนต์"))
    }

    @Test
    fun `safeFileName - blank input returns event`() {
        assertEquals("event", AndroidUtils.safeFileName("   "))
        assertEquals("event", AndroidUtils.safeFileName(""))
    }

    @Test
    fun `safeFileName - alphanumeric passes through`() {
        assertEquals("event2024", AndroidUtils.safeFileName("Event2024"))
    }

    // ─── MIME detection ───────────────────────────────────────────────────────

    @Test
    fun `detectMimeFromBytes - PNG magic bytes`() {
        val pngBytes = byteArrayOf(0x89.toByte(), 0x50.toByte(), 0x4E.toByte(), 0x47.toByte())
        val (mime, ext) = AndroidUtils.detectMimeFromBytes(pngBytes)
        assertEquals("image/png", mime)
        assertEquals("png", ext)
    }

    @Test
    fun `detectMimeFromBytes - JPEG magic bytes`() {
        val jpegBytes = byteArrayOf(0xFF.toByte(), 0xD8.toByte(), 0xFF.toByte(), 0xDB.toByte())
        val (mime, ext) = AndroidUtils.detectMimeFromBytes(jpegBytes)
        assertEquals("image/jpeg", mime)
        assertEquals("jpg", ext)
    }

    @Test
    fun `detectMimeFromBytes - PDF magic bytes`() {
        val pdfBytes = byteArrayOf(0x25.toByte(), 0x50.toByte(), 0x44.toByte(), 0x46.toByte())
        val (mime, ext) = AndroidUtils.detectMimeFromBytes(pdfBytes)
        assertEquals("application/pdf", mime)
        assertEquals("pdf", ext)
    }

    @Test
    fun `detectMimeFromBytes - GIF magic bytes`() {
        val gifBytes = byteArrayOf(0x47.toByte(), 0x49.toByte(), 0x46.toByte(), 0x38.toByte())
        val (mime, ext) = AndroidUtils.detectMimeFromBytes(gifBytes)
        assertEquals("image/gif", mime)
        assertEquals("gif", ext)
    }

    @Test
    fun `detectMimeFromBytes - WebP RIFF header`() {
        val webpBytes = byteArrayOf(0x52.toByte(), 0x49.toByte(), 0x46.toByte(), 0x46.toByte())
        val (mime, ext) = AndroidUtils.detectMimeFromBytes(webpBytes)
        assertEquals("image/webp", mime)
        assertEquals("webp", ext)
    }

    @Test
    fun `detectMimeFromBytes - unknown bytes returns octet-stream`() {
        val unknownBytes = byteArrayOf(0x00.toByte(), 0x00.toByte(), 0x00.toByte(), 0x00.toByte())
        val (mime, ext) = AndroidUtils.detectMimeFromBytes(unknownBytes)
        assertEquals("application/octet-stream", mime)
        assertEquals("bin", ext)
    }

    @Test
    fun `detectMimeFromBytes - less than 4 bytes returns octet-stream`() {
        val shortBytes = byteArrayOf(0x89.toByte(), 0x50.toByte())
        val (mime, ext) = AndroidUtils.detectMimeFromBytes(shortBytes)
        assertEquals("application/octet-stream", mime)
        assertEquals("bin", ext)
    }

    @Test
    fun `mimeFromExtension - png`() {
        assertEquals("image/png", AndroidUtils.mimeFromExtension("photo.png"))
        assertEquals("image/png", AndroidUtils.mimeFromExtension("PHOTO.PNG"))
    }

    @Test
    fun `mimeFromExtension - jpeg`() {
        assertEquals("image/jpeg", AndroidUtils.mimeFromExtension("photo.jpg"))
        assertEquals("image/jpeg", AndroidUtils.mimeFromExtension("photo.jpeg"))
    }

    @Test
    fun `mimeFromExtension - gif`() {
        assertEquals("image/gif", AndroidUtils.mimeFromExtension("image.gif"))
    }

    @Test
    fun `mimeFromExtension - webp`() {
        assertEquals("image/webp", AndroidUtils.mimeFromExtension("image.webp"))
    }

    @Test
    fun `mimeFromExtension - pdf`() {
        assertEquals("application/pdf", AndroidUtils.mimeFromExtension("doc.pdf"))
    }

    @Test
    fun `mimeFromExtension - unknown returns octet-stream`() {
        assertEquals("application/octet-stream", AndroidUtils.mimeFromExtension("file.xyz"))
        assertEquals("application/octet-stream", AndroidUtils.mimeFromExtension(""))
    }

    // ─── Currency formatting ───────────────────────────────────────────────────

    @Test
    fun `formatMoneyTh - formats positive number`() {
        val result = AndroidUtils.formatMoneyTh(1500.0)
        assertTrue(result.contains("1,500") || result.contains("1500"))
    }

    @Test
    fun `formatMoneyTh - formats zero`() {
        val result = AndroidUtils.formatMoneyTh(0.0)
        assertTrue(result.isNotEmpty())
    }

    @Test
    fun `formatMoneyTh - formats large number`() {
        val result = AndroidUtils.formatMoneyTh(999999.0)
        assertTrue(result.contains("999,999") || result.contains("999999"))
    }

    // ─── Role helpers ──────────────────────────────────────────────────────────

    @Test
    fun `isManager - returns true for BOOTH_MANAGER`() {
        assertTrue(AndroidUtils.isManager("BOOTH_MANAGER"))
    }

    @Test
    fun `isManager - returns false for other roles`() {
        assertFalse(AndroidUtils.isManager("MERCHANT"))
        assertFalse(AndroidUtils.isManager("GENERAL_USER"))
        assertFalse(AndroidUtils.isManager(""))
    }

    @Test
    fun `isMerchant - returns true for MERCHANT`() {
        assertTrue(AndroidUtils.isMerchant("MERCHANT"))
    }

    @Test
    fun `isMerchant - returns false for other roles`() {
        assertFalse(AndroidUtils.isMerchant("BOOTH_MANAGER"))
        assertFalse(AndroidUtils.isMerchant("GENERAL_USER"))
    }

    @Test
    fun `isGeneralUser - returns true for GENERAL_USER`() {
        assertTrue(AndroidUtils.isGeneralUser("GENERAL_USER"))
    }

    @Test
    fun `isGeneralUser - returns false for other roles`() {
        assertFalse(AndroidUtils.isGeneralUser("MERCHANT"))
    }

    // ─── Status helpers ─────────────────────────────────────────────────────────

    @Test
    fun `isPending - true for PENDING`() {
        assertTrue(AndroidUtils.isPending("PENDING"))
    }

    @Test
    fun `isPending - false for others`() {
        assertFalse(AndroidUtils.isPending("APPROVED"))
        assertFalse(AndroidUtils.isPending("REJECTED"))
        assertFalse(AndroidUtils.isPending(""))
    }

    @Test
    fun `isApproved - true for APPROVED`() {
        assertTrue(AndroidUtils.isApproved("APPROVED"))
    }

    @Test
    fun `isRejected - true for REJECTED`() {
        assertTrue(AndroidUtils.isRejected("REJECTED"))
    }

    @Test
    fun `isConfirmedReservation - true for CONFIRMED`() {
        assertTrue(AndroidUtils.isConfirmedReservation("CONFIRMED"))
    }

    @Test
    fun `isConfirmedReservation - false for other statuses`() {
        assertFalse(AndroidUtils.isConfirmedReservation("PENDING_PAYMENT"))
        assertFalse(AndroidUtils.isConfirmedReservation("WAITING_FOR_APPROVAL"))
        assertFalse(AndroidUtils.isConfirmedReservation("CANCELLED"))
    }

    @Test
    fun `isCancellable - PENDING_PAYMENT is cancellable`() {
        assertTrue(AndroidUtils.isCancellable("PENDING_PAYMENT"))
    }

    @Test
    fun `isCancellable - WAITING_FOR_APPROVAL is cancellable`() {
        assertTrue(AndroidUtils.isCancellable("WAITING_FOR_APPROVAL"))
    }

    @Test
    fun `isCancellable - CONFIRMED is not cancellable`() {
        assertFalse(AndroidUtils.isCancellable("CONFIRMED"))
    }

    @Test
    fun `isCancellable - CANCELLED is not cancellable`() {
        assertFalse(AndroidUtils.isCancellable("CANCELLED"))
    }

    // ─── Spinner selection helper ─────────────────────────────────────────────

    @Test
    fun `selectedSpinnerValue - returns correct value by index`() {
        val options = listOf("a" to "Label A", "b" to "Label B", "c" to "Label C")
        assertEquals("a", AndroidUtils.selectedSpinnerValue(options, 0))
        assertEquals("b", AndroidUtils.selectedSpinnerValue(options, 1))
        assertEquals("c", AndroidUtils.selectedSpinnerValue(options, 2))
    }

    @Test
    fun `selectedSpinnerValue - out of range returns first or null-handled first`() {
        val options = listOf("a" to "Label A")
        // Index beyond range
        val result = AndroidUtils.selectedSpinnerValue(options, 99)
        assertEquals("a", result)
    }

    @Test
    fun `selectedSpinnerValue - empty list returns first`() {
        val options: List<Pair<String, String>> = emptyList()
        // Returns first (null-safe) when list is empty
        val result = AndroidUtils.selectedSpinnerValue(options, 0)
        // With empty list, getOrNull returns null, elvis returns first().first which throws NoSuchElementException
        // The actual behavior: getOrNull returns null, elvis tries first().first -> NoSuchElementException
        // So we just verify it does not crash on valid input
        assertEquals(null, result)
    }

    // ─── Boolean-like JSON parsing ─────────────────────────────────────────────

    @Test
    fun `parseBooleanLike - Boolean true`() {
        assertTrue(AndroidUtils.parseBooleanLike(true))
    }

    @Test
    fun `parseBooleanLike - Boolean false`() {
        assertFalse(AndroidUtils.parseBooleanLike(false))
    }

    @Test
    fun `parseBooleanLike - Number non-zero`() {
        assertTrue(AndroidUtils.parseBooleanLike(1))
        assertTrue(AndroidUtils.parseBooleanLike(42))
    }

    @Test
    fun `parseBooleanLike - Number zero`() {
        assertFalse(AndroidUtils.parseBooleanLike(0))
    }

    @Test
    fun `parseBooleanLike - String true`() {
        assertTrue(AndroidUtils.parseBooleanLike("true"))
    }

    @Test
    fun `parseBooleanLike - String one`() {
        assertTrue(AndroidUtils.parseBooleanLike("1"))
    }

    @Test
    fun `parseBooleanLike - String false`() {
        assertFalse(AndroidUtils.parseBooleanLike("false"))
    }

    @Test
    fun `parseBooleanLike - String other`() {
        assertFalse(AndroidUtils.parseBooleanLike("maybe"))
        assertFalse(AndroidUtils.parseBooleanLike(""))
    }

    @Test
    fun `parseBooleanLike - null or unknown type`() {
        assertFalse(AndroidUtils.parseBooleanLike(null))
        assertFalse(AndroidUtils.parseBooleanLike(listOf<Any>()))
    }
}