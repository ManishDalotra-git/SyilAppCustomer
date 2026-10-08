import {
  createNavigationContainerRef,
} from '@react-navigation/native';


// ============================================================
// NAVIGATION REF
// ============================================================
//
// IMPORTANT:
// Yehi navigationRef App.jsx ke NavigationContainer
// mein bhi use hoga.
//
// Isse FCM / native notification click ke time
// screen par navigate kar sakte hain.
//
// ============================================================

export const navigationRef =
  createNavigationContainerRef();


// ============================================================
// PENDING TICKET
// ============================================================
//
// Kabhi notification click ho sakta hai jab
// NavigationContainer abhi ready na ho.
//
// Us case mein ticket data temporarily
// yahan store hoga.
//
// ============================================================

let pendingTicketData = null;


// ============================================================
// OPEN TICKET FROM NOTIFICATION
// ============================================================

export const openTicketFromNotification = (
  data
) => {

  try {

    console.log(
      '=========================================='
    );

    console.log(
      'CUSTOMER NOTIFICATION NAVIGATION'
    );

    console.log(
      'Notification data:',
      data
    );

    console.log(
      '=========================================='
    );


    // ========================================================
    // VALIDATE TICKET ID
    // ========================================================

    if (
      !data ||
      !data.ticketId
    ) {

      console.log(
        'Notification navigation skipped: ticketId missing'
      );

      return;
    }


    // ========================================================
    // PREPARE ROUTE PARAMS
    // ========================================================

    const routeParams = {

      ticketId:
        String(
          data.ticketId
        ),

      subject:
        String(
          data.ticketSubject ||
          data.subject ||
          'Ticket Details'
        ),

      threadId:
        String(
          data.threadId || ''
        ),

      fromNotification:
        true,

    };


    // ========================================================
    // NAVIGATION NOT READY
    // ========================================================

    if (
      !navigationRef.isReady()
    ) {

      console.log(
        'Navigation not ready - storing pending Customer ticket'
      );


      pendingTicketData =
        routeParams;


      return;
    }


    // ========================================================
    // NAVIGATE TO TICKET DETAIL
    // ========================================================

    console.log(
      'Opening Customer ViewTicketDetail:',
      routeParams.ticketId
    );


    navigationRef.navigate(
      'ViewTicketDetail',
      routeParams
    );


  } catch (error) {

    console.log(
      'Customer notification navigation error:',
      error
    );

  }

};


// ============================================================
// OPEN PENDING TICKET
// ============================================================
//
// App.jsx ke NavigationContainer ready hone ke baad
// is function ko call kar sakte hain.
//
// ============================================================

export const openPendingTicket =
  () => {

    try {

      if (
        !pendingTicketData
      ) {

        return;
      }


      if (
        !navigationRef.isReady()
      ) {

        console.log(
          'Navigation still not ready for pending Customer ticket'
        );

        return;
      }


      const routeParams =
        pendingTicketData;


      /*
       * Navigation se pehle pending data clear kar dete hain
       * taaki same notification dobara open na ho.
       */

      pendingTicketData =
        null;


      console.log(
        'Opening pending Customer ticket:',
        routeParams.ticketId
      );


      navigationRef.navigate(
        'ViewTicketDetail',
        routeParams
      );


    } catch (error) {

      console.log(
        'Customer pending ticket navigation error:',
        error
      );

    }

  };


// ============================================================
// CLEAR PENDING TICKET
// ============================================================

export const clearPendingTicket =
  () => {

    pendingTicketData =
      null;

  };