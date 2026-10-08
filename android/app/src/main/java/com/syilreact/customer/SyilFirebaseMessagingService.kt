package com.syilreact.customer

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

import androidx.core.app.NotificationCompat

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage


class SyilFirebaseMessagingService : FirebaseMessagingService() {


    companion object {

        private const val TAG =
            "SyilFirebaseMessaging"


        private const val CHANNEL_ID =
            "syil_support_messages"


        private const val CHANNEL_NAME =
            "Support Messages"

    }


    // ========================================================
    // MESSAGE RECEIVED
    // ========================================================

    override fun onMessageReceived(
        remoteMessage: RemoteMessage
    ) {

        super.onMessageReceived(
            remoteMessage
        )


        try {

            Log.d(
                TAG,
                "Customer Firebase message received"
            )


            // =================================================
            // DATA PAYLOAD
            // =================================================

            val data =
                remoteMessage.data


            // =================================================
            // TITLE
            // =================================================

            val title =
                data["notificationTitle"]
                    ?: data["title"]
                    ?: remoteMessage.notification?.title
                    ?: "SYIL Support"


            // =================================================
            // BODY
            // =================================================

            val body =
                data["notificationBody"]
                    ?: data["body"]
                    ?: remoteMessage.notification?.body
                    ?: "You have a new support message."


            // =================================================
            // TICKET DATA
            // =================================================

            val ticketId =
                data["ticketId"] ?: ""


            val ticketSubject =
                data["ticketSubject"] ?: ""


            val threadId =
                data["threadId"] ?: ""


            // =================================================
            // OPTIONAL UNREAD COUNT
            // =================================================

            val totalUnreadCount =
                data["totalUnreadCount"]
                    ?.toIntOrNull()
                    ?: 0


            Log.d(
                TAG,
                "Customer notification ticketId: $ticketId"
            )


            Log.d(
                TAG,
                "Customer notification threadId: $threadId"
            )


            Log.d(
                TAG,
                "Customer notification unread count: $totalUnreadCount"
            )


            // =================================================
            // SHOW NOTIFICATION
            // =================================================

            showNotification(
                title = title,
                body = body,
                ticketId = ticketId,
                ticketSubject = ticketSubject,
                threadId = threadId
            )


        } catch (error: Exception) {

            Log.e(
                TAG,
                "Customer Firebase message processing error",
                error
            )

        }

    }


    // ========================================================
    // SHOW ANDROID NOTIFICATION
    // ========================================================

    private fun showNotification(
        title: String,
        body: String,
        ticketId: String,
        ticketSubject: String,
        threadId: String
    ) {

        try {

            // =================================================
            // CREATE NOTIFICATION CHANNEL
            // =================================================

            createNotificationChannel()


            // =================================================
            // OPEN MAIN ACTIVITY ON CLICK
            // =================================================

            val intent =
                Intent(
                    this,
                    MainActivity::class.java
                ).apply {

                    putExtra(
                        "ticketId",
                        ticketId
                    )


                    putExtra(
                        "ticketSubject",
                        ticketSubject
                    )


                    putExtra(
                        "threadId",
                        threadId
                    )


                    putExtra(
                        "fromNotification",
                        true
                    )


                    flags =
                        Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP

                }


            // =================================================
            // UNIQUE PENDING INTENT
            // =================================================

            val requestCode =
                if (
                    ticketId.isNotEmpty()
                ) {

                    ticketId.hashCode()

                } else {

                    System.currentTimeMillis()
                        .toInt()

                }


            val pendingIntent =
                PendingIntent.getActivity(
                    this,
                    requestCode,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or
                        PendingIntent.FLAG_IMMUTABLE
                )


            // =================================================
            // UNIQUE NOTIFICATION ID
            // =================================================

            val notificationId =
                (
                    System.currentTimeMillis() and
                        0x7FFFFFFF
                    ).toInt()


            // =================================================
            // NOTIFICATION BUILDER
            // =================================================

            val notificationBuilder =
                NotificationCompat.Builder(
                    this,
                    CHANNEL_ID
                )
                    .setSmallIcon(
                        applicationInfo.icon
                    )
                    .setContentTitle(
                        title
                    )
                    .setContentText(
                        body
                    )
                    .setStyle(
                        NotificationCompat
                            .BigTextStyle()
                            .bigText(body)
                    )
                    .setPriority(
                        NotificationCompat.PRIORITY_HIGH
                    )
                    .setAutoCancel(
                        true
                    )
                    .setContentIntent(
                        pendingIntent
                    )


            /*
             * IMPORTANT:
             *
             * setNumber(totalUnreadCount)
             * intentionally use nahi kar rahe.
             *
             * Dealer app ki tarah badge count ko
             * Android launcher par force nahi karna.
             */


            // =================================================
            // SHOW NOTIFICATION
            // =================================================

            val notificationManager =
                getSystemService(
                    Context.NOTIFICATION_SERVICE
                ) as NotificationManager


            /*
             * Ticket-specific tag.
             *
             * NotificationBadgeModule later isi pattern
             * ko use karke ek particular ticket ki
             * notifications cancel kar sakta hai.
             */

            val notificationTag =
                "FCM-Ticket:$ticketId:$notificationId"


            notificationManager.notify(
                notificationTag,
                notificationId,
                notificationBuilder.build()
            )


            Log.d(
                TAG,
                "Customer notification shown for ticket: $ticketId"
            )


        } catch (error: Exception) {

            Log.e(
                TAG,
                "Customer notification display error",
                error
            )

        }

    }


    // ========================================================
    // CREATE NOTIFICATION CHANNEL
    // ========================================================

    private fun createNotificationChannel() {

        if (
            Build.VERSION.SDK_INT >=
            Build.VERSION_CODES.O
        ) {

            val notificationManager =
                getSystemService(
                    Context.NOTIFICATION_SERVICE
                ) as NotificationManager


            val existingChannel =
                notificationManager
                    .getNotificationChannel(
                        CHANNEL_ID
                    )


            if (
                existingChannel == null
            ) {

                val channel =
                    NotificationChannel(
                        CHANNEL_ID,
                        CHANNEL_NAME,
                        NotificationManager.IMPORTANCE_HIGH
                    ).apply {

                        description =
                            "SYIL Customer support message notifications"


                        enableVibration(
                            true
                        )


                        setShowBadge(
                            true
                        )

                    }


                notificationManager
                    .createNotificationChannel(
                        channel
                    )


                Log.d(
                    TAG,
                    "Customer notification channel created"
                )

            }

        }

    }


    // ========================================================
    // NEW FCM TOKEN
    // ========================================================

    override fun onNewToken(
        token: String
    ) {

        super.onNewToken(
            token
        )


        /*
         * Token ko yahan log/save nahi kar rahe.
         *
         * React Native side ka onTokenRefresh listener
         * refreshed token ko Customer backend me save karega.
         */

        Log.d(
            TAG,
            "Customer Firebase token refreshed"
        )

    }

}