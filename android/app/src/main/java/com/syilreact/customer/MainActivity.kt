package com.syilreact.customer

import android.content.Intent
import android.os.Bundle
import android.util.Log

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate


class MainActivity : ReactActivity() {


    companion object {

        private const val TAG =
            "MainActivity"
    }


    // ========================================================
    // REACT NATIVE COMPONENT NAME
    // ========================================================

    override fun getMainComponentName(): String =
        "syilReact"


    // ========================================================
    // ACTIVITY CREATED
    // ========================================================

    override fun onCreate(
        savedInstanceState: Bundle?
    ) {

        super.onCreate(
            savedInstanceState
        )


        /*
         * App agar notification click se
         * cold start hua hai to initial Intent
         * yahan handle hoga.
         */

        handleNotificationIntent(
            intent
        )
    }


    // ========================================================
    // NEW INTENT
    // ========================================================

    override fun onNewIntent(
        intent: Intent
    ) {

        super.onNewIntent(
            intent
        )


        /*
         * IMPORTANT:
         *
         * MainActivity singleTask mode me hai.
         * Agar app already running/background me ho
         * aur notification click ho to Android
         * existing Activity ko ye new Intent deta hai.
         */

        setIntent(
            intent
        )


        handleNotificationIntent(
            intent
        )
    }


    // ========================================================
    // HANDLE NOTIFICATION INTENT
    // ========================================================

    private fun handleNotificationIntent(
        intent: Intent?
    ) {

        try {

            if (
                intent == null
            ) {

                return
            }


            // =================================================
            // CHECK NOTIFICATION FLAG
            // =================================================

            val fromNotification =
                intent.getBooleanExtra(
                    "fromNotification",
                    false
                )


            if (
                !fromNotification
            ) {

                return
            }


            // =================================================
            // GET TICKET DATA
            // =================================================

            val ticketId =
                intent.getStringExtra(
                    "ticketId"
                )


            val ticketSubject =
                intent.getStringExtra(
                    "ticketSubject"
                )


            val threadId =
                intent.getStringExtra(
                    "threadId"
                )


            Log.d(
                TAG,
                "Customer notification Intent received"
            )


            Log.d(
                TAG,
                "ticketId: $ticketId"
            )


            Log.d(
                TAG,
                "threadId: $threadId"
            )


            // =================================================
            // VALIDATE TICKET
            // =================================================

            if (
                ticketId.isNullOrEmpty()
            ) {

                Log.d(
                    TAG,
                    "Customer notification Intent ignored: ticketId missing"
                )

                return
            }


            // =================================================
            // SAVE NOTIFICATION FOR REACT NATIVE
            // =================================================

            NotificationBadgeModule
                .savePendingNotification(
                    ticketId = ticketId,
                    ticketSubject =
                        ticketSubject ?: "",
                    threadId =
                        threadId ?: ""
                )


            Log.d(
                TAG,
                "Customer notification saved for React Native"
            )


        } catch (error: Exception) {

            Log.e(
                TAG,
                "Customer notification Intent error",
                error
            )

        }

    }


    // ========================================================
    // REACT ACTIVITY DELEGATE
    // ========================================================

    override fun createReactActivityDelegate():
        ReactActivityDelegate =

        DefaultReactActivityDelegate(
            this,
            mainComponentName,
            fabricEnabled
        )

}