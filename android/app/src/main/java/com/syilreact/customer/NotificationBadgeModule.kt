package com.syilreact.customer

import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.lang.ref.WeakReference


class NotificationBadgeModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {


    init {

        reactContextReference =
            WeakReference(reactContext)

        Log.d(
            TAG,
            "Customer NotificationBadgeModule initialized"
        )
    }


    // ========================================================
    // MODULE NAME
    // ========================================================

    override fun getName(): String {

        return "NotificationBadge"
    }


    // ========================================================
    // GET PENDING NOTIFICATION
    // ========================================================

    @ReactMethod
    fun getPendingNotification(
        promise: Promise
    ) {

        try {

            synchronized(lock) {

                val ticketId =
                    pendingTicketId


                if (
                    ticketId.isNullOrEmpty()
                ) {

                    promise.resolve(null)

                    return
                }


                val result =
                    Arguments.createMap()


                result.putString(
                    "ticketId",
                    ticketId
                )


                result.putString(
                    "ticketSubject",
                    pendingTicketSubject ?: ""
                )


                result.putString(
                    "threadId",
                    pendingThreadId ?: ""
                )


                result.putBoolean(
                    "fromNotification",
                    true
                )


                // --------------------------------------------
                // Clear pending notification after reading it
                // --------------------------------------------

                clearPendingNotificationInternal()


                promise.resolve(result)

            }


        } catch (error: Exception) {

            Log.e(
                TAG,
                "Error getting pending Customer notification",
                error
            )


            promise.reject(
                "PENDING_NOTIFICATION_ERROR",
                error
            )
        }
    }


    // ========================================================
    // CANCEL NOTIFICATIONS FOR ONE TICKET
    // ========================================================

    @ReactMethod
    fun cancelTicketNotifications(
        ticketId: String
    ) {

        try {

            val context =
                reactApplicationContext


            val notificationManager =
                context.getSystemService(
                    Context.NOTIFICATION_SERVICE
                ) as NotificationManager


            if (
                Build.VERSION.SDK_INT >=
                Build.VERSION_CODES.M
            ) {

                val activeNotifications =
                    notificationManager.activeNotifications


                activeNotifications.forEach {
                    notification ->


                    val tag =
                        notification.tag ?: ""


                    if (
                        tag.startsWith(
                            "FCM-Ticket:$ticketId:"
                        )
                    ) {

                        notificationManager.cancel(
                            notification.tag,
                            notification.id
                        )


                        Log.d(
                            TAG,
                            "Cancelled Customer notification for ticket: $ticketId"
                        )
                    }

                }

            }


            // --------------------------------------------
            // Also clear matching pending notification
            // --------------------------------------------

            synchronized(lock) {

                if (
                    pendingTicketId ==
                    ticketId
                ) {

                    clearPendingNotificationInternal()
                }

            }


        } catch (error: Exception) {

            Log.e(
                TAG,
                "Error cancelling Customer ticket notifications",
                error
            )
        }
    }


    // ========================================================
    // SET BADGE
    // ========================================================

    @ReactMethod
    fun setBadge(
        count: Int
    ) {

        /*
         * We intentionally do not use
         * NotificationCompat.Builder.setNumber().
         *
         * Some Android launchers interpret setNumber()
         * differently and can show misleading badge counts.
         */

        Log.d(
            TAG,
            "Customer setBadge called with count: $count"
        )
    }


    // ========================================================
    // CLEAR BADGE / FCM TICKET NOTIFICATIONS
    // ========================================================

    @ReactMethod
    fun clearBadge() {

        try {

            val context =
                reactApplicationContext


            val notificationManager =
                context.getSystemService(
                    Context.NOTIFICATION_SERVICE
                ) as NotificationManager


            if (
                Build.VERSION.SDK_INT >=
                Build.VERSION_CODES.M
            ) {

                val activeNotifications =
                    notificationManager.activeNotifications


                activeNotifications.forEach {
                    notification ->


                    val tag =
                        notification.tag ?: ""


                    if (
                        tag.startsWith(
                            "FCM-Ticket:"
                        )
                    ) {

                        notificationManager.cancel(
                            notification.tag,
                            notification.id
                        )

                    }

                }

            }


            synchronized(lock) {

                clearPendingNotificationInternal()

            }


            Log.d(
                TAG,
                "Customer notification badge cleared"
            )


        } catch (error: Exception) {

            Log.e(
                TAG,
                "Error clearing Customer notifications",
                error
            )
        }
    }


    companion object {

        private const val TAG =
            "NotificationBadge"


        private val lock =
            Any()


        // ====================================================
        // PENDING NOTIFICATION DATA
        // ====================================================

        private var pendingTicketId:
            String? = null


        private var pendingTicketSubject:
            String? = null


        private var pendingThreadId:
            String? = null


        // ====================================================
        // REACT CONTEXT
        // ====================================================

        private var reactContextReference:
            WeakReference<ReactApplicationContext>? =
            null


        // ====================================================
        // SAVE PENDING NOTIFICATION
        // ====================================================

        fun savePendingNotification(
            ticketId: String?,
            ticketSubject: String?,
            threadId: String?
        ) {

            if (
                ticketId.isNullOrEmpty()
            ) {

                Log.d(
                    TAG,
                    "Customer pending notification ignored: ticketId missing"
                )

                return
            }


            synchronized(lock) {

                pendingTicketId =
                    ticketId


                pendingTicketSubject =
                    ticketSubject ?: ""


                pendingThreadId =
                    threadId ?: ""

            }


            Log.d(
                TAG,
                "Saved pending Customer notification for ticket: $ticketId"
            )


            // =================================================
            // IF REACT NATIVE IS ALREADY ACTIVE,
            // SEND EVENT IMMEDIATELY
            // =================================================

            emitNotificationClicked()
        }


        // ====================================================
        // EMIT NOTIFICATION CLICK TO JAVASCRIPT
        // ====================================================

        private fun emitNotificationClicked() {

            try {

                val reactContext =
                    reactContextReference?.get()
                        ?: return


                if (
                    !reactContext.hasActiveCatalystInstance()
                ) {

                    Log.d(
                        TAG,
                        "React context not active yet - Customer notification kept pending"
                    )

                    return
                }


                val ticketId =
                    synchronized(lock) {
                        pendingTicketId
                    }


                if (
                    ticketId.isNullOrEmpty()
                ) {

                    return
                }


                val params =
                    Arguments.createMap()


                params.putString(
                    "ticketId",
                    ticketId
                )


                params.putString(
                    "ticketSubject",
                    synchronized(lock) {
                        pendingTicketSubject ?: ""
                    }
                )


                params.putString(
                    "threadId",
                    synchronized(lock) {
                        pendingThreadId ?: ""
                    }
                )


                params.putBoolean(
                    "fromNotification",
                    true
                )


                reactContext
                    .getJSModule(
                        DeviceEventManagerModule
                            .RCTDeviceEventEmitter::class.java
                    )
                    .emit(
                        "notificationClicked",
                        params
                    )


                Log.d(
                    TAG,
                    "Customer notificationClicked event emitted"
                )


                /*
                 * Event React Native ko successfully send
                 * ho gaya, isliye pending data clear kar do.
                 */

                synchronized(lock) {

                    clearPendingNotificationInternal()

                }


            } catch (error: Exception) {

                Log.e(
                    TAG,
                    "Error emitting Customer notification click event",
                    error
                )
            }
        }


        // ====================================================
        // CLEAR PENDING DATA
        // ====================================================

        private fun clearPendingNotificationInternal() {

            pendingTicketId =
                null


            pendingTicketSubject =
                null


            pendingThreadId =
                null
        }
    }
}