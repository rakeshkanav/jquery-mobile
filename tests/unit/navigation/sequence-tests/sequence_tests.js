(function($) {

	// The following tests are not independent of each other. Thus, if you find
	// that one of them fails, and it causes the failure of the rest of the tests,
	// but that, if you change the order of the tests, it passes, then you should
	// copy the tests over so that both orders are tested here.
	//
	// The more we click around the test pages and the more combinations of paths
	// we try, the better.

	$.testHelper.setPushState();

	// If the start page is not there, wait for it to appear. Otherwise, leave
	// some time before starting the actual run to allow the popstate handler to
	// awaken from its slumber
	function maybeWaitForStartPage( seq, prefix ) {
		if ( $( "#basicTestPage" ).length === 0 ) {
			$.testHelper.detailedEventCascade([
				// This empty function and the following "navigate" event test is
				// necessary to ensure that, when the initial URL contains the path to a
				// page to be loaded via AJAX, the loading process which is done via a
				// synthetic hashchange event completes.
				function() { },
				{ navigate: { src: $( document ), event: "navigate." + prefix + "0" } },
				function() {
					$.testHelper.detailedEventCascade( seq );
				}
			]);
		}
		else {
			// You can tweak the timeout below to make the tests run faster, but if
			// you do, make sure it greatly exceeds the timeout used for the pushState
			// slumber - i.e., the brief time immediately following an adjustment made
			// by the pushState plugin during which, if the location were to require
			// an adjustment by the pushState plugin, it will not get such an
			// adjustment because the pushState plugin ignores such requests.
			setTimeout( function() { $.testHelper.detailedEventCascade( seq ); }, 1000 );
		}
	}

	asyncTest( "Returning from a dialog results in the page from which it opened", function() {
		expect( 2 );

		maybeWaitForStartPage([
			function() { $( "#openBasicDialog" ).click(); },
			{
				navigate: { src: $( document ), event: "navigate.returningFromADialogStep1" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.returningFromADialogStep1" }
			},
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "basicDialog", "Basic dialog has opened" );
				$( "a:first", $.mobile.activePage[ 0 ] ).click();
			},
			{
				navigate: { src: $( document ), event: "navigate.returningFromADialogStep2" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.returningFromADialogStep2" }
			},
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "basicTestPage", "Active page is original page" );
				start();
			}
		], "returningFromADialog" );
	});

	asyncTest( "Returning from a popup results in the page from which it opened", function() {
		var origActive;

		expect( 5 );

		maybeWaitForStartPage([
			function() {
				origActive = $.mobile.activePage;
				$( "#openPopup" ).click();
			},
			{
				popupafteropen: { src: function() { return $( "#thePopup" ); }, event: "popupafteropen.returnFromPopupStep1" },
				navigate: { src: $.mobile.pageContainer, event: "navigate.returnFromPopupStep1" }
			},
			function( result ) {
				ok( !result.popupafteropen.timedOut, "Popup emitted 'popupafteropen'" );
				ok( !result.navigate.timedOut, "A 'navigate' event has occurred as a result of opening the popup" );
				$( "#thePopup" ).parent().prev().click();
			},
			{
				popupafterclose: { src: function() { return $( "#thePopup" ); }, event: "popupafterclose.returnFromPopupStep2" },
				navigate: { src: $.mobile.pageContainer, event: "navigate.returnFromPopupStep2" }
			},
			function( result ) {
				ok( !result.popupafterclose.timedOut, "Popup emitted 'popupafterclose'" );
				ok( !result.navigate.timedOut, "A 'navigate' event has occurred as a result of opening the popup" );
				ok( $.mobile.activePage[ 0 ] === origActive[ 0 ], "The active page is the same as it was before opening the popup" );
				start();
			},
		], "returnFromPopup" );
	});

	asyncTest( "Going from a dialog to another page works", function() {

		expect( 3 );

		maybeWaitForStartPage([
			function() { $( "#openBasicDialog" ).click(); },
			{
				navigate: { src: $( document ), event: "navigate.GoingFromADialogToAnotherPageStep1" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.GoingFromADialogToAnotherPageStep1" }
			},
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "basicDialog", "Basic dialog has opened" );
				$( "#fromDialogToAnotherPage" ).click();
			},
			{
				navigate: { src: $( document ), event: "navigate.GoingFromADialogToAnotherPageStep2" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.GoingFromADialogToAnotherPageStep2" }
			},
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "anotherPage", "Landed on another page" );
				$.mobile.back();
			},
			{
				navigate: { src: $( document ), event: "navigate.GoingFromADialogToAnotherPageStep3" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.GoingFromADialogToAnotherPageStep3" }
			},
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "basicTestPage", "Coming back from another page to the start page works" );
				start();
			}
		], "GoingFromADialogToAnotherPage" );
	});

	asyncTest( "Going from a popup to another page works", function() {

		expect( 4 );

		maybeWaitForStartPage([
			function() {
				$( "#openPopup" ).click();
			},
			{
				popupafteropen: { src: function() { return $( "#thePopup" ); }, event: "popupafteropen.GoingFromAPopupToAnotherPageStep1" },
				navigate: { src: $.mobile.pageContainer, event: "navigate.GoingFromAPopupToAnotherPageStep1" }
			},
			function( result ) {
				ok( !result.popupafteropen.timedOut, "Popup emitted 'popupafteropen'" );
				ok( !result.navigate.timedOut, "A 'navigate' event has occurred as a result of opening the popup" );
				$( "#openPageFromPopup" ).click();
			},
			{
				navigate: { src: $( document ), event: "navigate.GoingFromAPopupToAnotherPageStep2" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.GoingFromAPopupToAnotherPageStep2" }
			},
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "anotherPage", "Landed on another page" );
				$.mobile.back();
			},
			{
				navigate: { src: $( document ), event: "navigate.GoingFromAPopupToAnotherPageStep3" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.GoingFromAPopupToAnotherPageStep3" }
			},
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "basicTestPage", "Coming back from another page to the start page works" );
				start();
			}
		], "GoingFromAPopupToAnotherPage" );
	});

	asyncTest( "Opening one dialog followed by opening another dialog works", function() {

		expect( 4 );

		maybeWaitForStartPage([
			// NOTE: The first part of this test is a copy of the test above
			function() { $( "#openBasicDialog" ).click(); },
			{
				navigate: { src: $( document ), event: "navigate.openingOneDialogFollowedByAnotherStep1" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.openingOneDialogFollowedByAnotherStep1" }
			},
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "basicDialog", "Basic dialog has opened" );
				$( "a:first", $.mobile.activePage[ 0 ] ).click();
			},
			{
				navigate: { src: $( document ), event: "navigate.openingOneDialogFollowedByAnotherStep2" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.openingOneDialogFollowedByAnotherStep2" }
			},

			// NOTE: The second part of this test is also a copy of the test above
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "basicTestPage", "Active page is original page" );
				$( "#openAnotherDialog" ).click();
			},
			{
				navigate: { src: $( document ), event: "navigate.openingOneDialogFollowedByAnotherStep3" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.openingOneDialogFollowedByAnotherStep3" }
			},
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "anotherDialog", "Another dialog has opened" );
				$( "a:first", $.mobile.activePage[ 0 ] ).click();
			},
			{
				navigate: { src: $( document ), event: "navigate.openingOneDialogFollowedByAnotherStep4" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.openingOneDialogFollowedByAnotherStep4" }
			},
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "basicTestPage", "Active page is original page" );
				start();
			},
		], "openingOneDialogFollowedByAnother" );
	});

	asyncTest( "Opening one popup followed by opening another popup works", function() {
		var origActive;

		expect( 10 );

		maybeWaitForStartPage([
			// NOTE: This is basically two copies of the "returning from a popup test" one after the other
			function() {
				origActive = $.mobile.activePage;
				$( "#openPopup" ).click();
			},
			{
				popupafteropen: { src: function() { return $( "#thePopup" ); }, event: "popupafteropen.openingOnePopupFollwedByAnotherStep1" },
				navigate: { src: $.mobile.pageContainer, event: "navigate.openingOnePopupFollwedByAnotherStep1" }
			},
			function( result ) {
				ok( !result.popupafteropen.timedOut, "Popup emitted 'popupafteropen'" );
				ok( !result.navigate.timedOut, "A 'navigate' event has occurred as a result of opening the popup" );
				$( "#thePopup" ).parent().prev().click();
			},
			{
				popupafterclose: { src: function() { return $( "#thePopup" ); }, event: "popupafterclose.openingOnePopupFollwedByAnotherStep2" },
				navigate: { src: $.mobile.pageContainer, event: "navigate.openingOnePopupFollwedByAnotherStep2" },
				// bogus event to delay the opening of the second popup in order to make
				// sure that the pushState handler comes out of its timeout-induced
				// slumber. This is unnecessary for dialogs, because they have transitions which
				// take longer than the timeout
				xyzzy: { src: $.mobile.pageContainer, event: "xyzzy.openingOnePopupFollowedByAnotherStep2" }
			},
			function( result ) {
				ok( !result.popupafterclose.timedOut, "Popup emitted 'popupafterclose'" );
				ok( !result.navigate.timedOut, "A 'navigate' event has occurred as a result of closing the popup" );
				ok( $.mobile.activePage[ 0 ] === origActive[ 0 ], "The active page is the same as it was before opening the popup" );
				$( "#openAnotherPopup" ).click();
			},
			{
				popupafteropen: { src: function() { return $( "#anotherPopup" ); }, event: "popupafteropen.openingOnePopupFollwedByAnotherStep3" },
				navigate: { src: $.mobile.pageContainer, event: "navigate.openingOnePopupFollwedByAnotherStep3" }
			},
			function( result ) {
				ok( !result.popupafteropen.timedOut, "Popup emitted 'popupafteropen'" );
				ok( !result.navigate.timedOut, "A 'navigate' event has occurred as a result of opening the popup" );
				$( "#anotherPopup" ).parent().prev().click();
			},
			{
				popupafterclose: { src: function() { return $( "#anotherPopup" ); }, event: "popupafterclose.openingOnePopupFollwedByAnotherStep4" },
				navigate: { src: $.mobile.pageContainer, event: "navigate.openingOnePopupFollwedByAnotherStep4" }
			},
			function( result ) {
				ok( !result.popupafterclose.timedOut, "Popup emitted 'popupafterclose'" );
				ok( !result.navigate.timedOut, "A 'navigate' event has occurred as a result of opening the popup" );
				ok( $.mobile.activePage[ 0 ] === origActive[ 0 ], "The active page is the same as it was before opening the popup" );
				start();
			}
		], "openingOnePopupFollwedByAnother" );
	});

	asyncTest( "Opening another page after returning from a dialog works", function() {
		expect( 4 );

		maybeWaitForStartPage([
			function() { $( "#openBasicDialog" ).click(); },
			{
				navigate: { src: $( document ), event: "navigate.openingAnotherPageAfterDialogStep1" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.openingAnotherPageAfterDialogStep1" }
			},
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "basicDialog", "Basic dialog has opened" );
				$( "a:first", $.mobile.activePage[ 0 ] ).click();
			},
			{
				navigate: { src: $( document ), event: "navigate.openingAnotherPageAfterDialogStep2" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.openingAnotherPageAfterDialogStep2" }
			},
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "basicTestPage", "Active page is original page" );
				$( "#openAnotherPage" ).click();
			},
			{
				navigate: { src: $( document ), event: "navigate.GoingFromADialogToAnotherPageStep3" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.GoingFromADialogToAnotherPageStep3" }
			},
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "anotherPage", "Landed on another page" );
				$.mobile.back();
			},
			{
				navigate: { src: $( document ), event: "navigate.openingAnotherPageAfterDialogStep4" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.openingAnotherPageAfterDialogStep4" }
			},
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "basicTestPage", "Active page is original page" );
				start();
			},
		], "openingAnotherPageAfterDialog" );
	});

	asyncTest( "Opening another page after returning from a popup works", function() {
		expect( 7 );

		maybeWaitForStartPage([
			function() {
				origActive = $.mobile.activePage;
				$( "#openPopup" ).click();
			},
			{
				popupafteropen: { src: function() { return $( "#thePopup" ); }, event: "popupafteropen.openingAnotherPageAfterPopupStep1" },
				navigate: { src: $.mobile.pageContainer, event: "navigate.openingAnotherPageAfterPopupStep1" }
			},
			function( result ) {
				ok( !result.popupafteropen.timedOut, "Popup emitted 'popupafteropen'" );
				ok( !result.navigate.timedOut, "A 'navigate' event has occurred as a result of opening the popup" );
				$( "#thePopup" ).parent().prev().click();
			},
			{
				popupafterclose: { src: function() { return $( "#thePopup" ); }, event: "popupafterclose.openingAnotherPageAfterPopupStep2" },
				navigate: { src: $.mobile.pageContainer, event: "navigate.openingAnotherPageAfterPopupStep2" }
			},
			function( result ) {
				ok( !result.popupafterclose.timedOut, "Popup emitted 'popupafterclose'" );
				ok( !result.navigate.timedOut, "A 'navigate' event has occurred as a result of opening the popup" );
				ok( $.mobile.activePage[ 0 ] === origActive[ 0 ], "The active page is the same as it was before opening the popup" );
				$( "#openAnotherPage" ).click();
			},
			{
				navigate: { src: $( document ), event: "navigate.openingAnotherPageAfterPopupStep3" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.openingAnotherPageAfterPopupStep3" }
			},
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "anotherPage", "Landed on another page" );
				$.mobile.back();
			},
			{
				navigate: { src: $( document ), event: "navigate.openingAnotherPageAfterPopupStep4" },
				pagechange: { src: $.mobile.pageContainer, event: "pagechange.openingAnotherPageAfterPopupStep4" }
			},
			function() {
				ok( $.mobile.activePage.attr( "id" ) === "basicTestPage", "Active page is original page" );
				start();
			},
		], "openingAnotherPageAfterPopup" );
	});

})( jQuery );
