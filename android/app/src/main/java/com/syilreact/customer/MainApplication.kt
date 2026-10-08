package com.syilreact.customer

import android.app.Application

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost


class MainApplication : Application(), ReactApplication {


  // ==========================================================
  // REACT HOST
  // ==========================================================

  override val reactHost: ReactHost by lazy {

    getDefaultReactHost(

      context = applicationContext,

      packageList =

        PackageList(this).packages.apply {

          // ==================================================
          // CUSTOMER NOTIFICATION NATIVE MODULE
          // ==================================================
          //
          // NotificationBadgePackage custom native package hai,
          // isliye ise manually register karna required hai.
          //
          // ==================================================

          add(
            NotificationBadgePackage()
          )

        },

    )

  }


  // ==========================================================
  // APPLICATION CREATE
  // ==========================================================

  override fun onCreate() {

    super.onCreate()

    loadReactNative(this)

  }

}