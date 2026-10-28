// Generated from openapi.yaml by `pnpm --filter @htco/api-client generate`. Do not edit.

export interface paths {
    "/healthz": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The process is alive
         * @description Liveness: answers without touching any dependency.
         */
        get: operations["healthz"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/readyz": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Every dependency is ready
         * @description Readiness: runs every dependency check with a timeout.
         */
        get: operations["readyz"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/audit-log": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The organization's audit records (Owner and Admins)
         * @description Newest first; `since` is inclusive and `until` exclusive; `shop_id` matches the shop's
         *     own records and those naming it; pass `next_cursor` back as `cursor` for the next page.
         */
        get: operations["list_audit_log"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/invitations/accept": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Accept an invitation: set a password and sign in
         * @description Sets the invited user's password with Supabase Auth and starts a server-side session,
         *     exactly like a sign-in (same cookie, `no-store`).
         */
        post: operations["accept_web_invitation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/mfa": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Two-factor status of this session
         * @description The session's assurance and the user's authenticator apps and passkeys.
         */
        get: operations["get_mfa_status"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/mfa/enroll": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Start setting up an authenticator app
         * @description Returns the QR code (and the secret, for typing it in) to add to the app.
         */
        post: operations["start_mfa_enrollment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/mfa/factors/{factor_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Remove a passkey or an authenticator app
         * @description Needs a session signed in with two factors; the last factor stays (audited).
         */
        delete: operations["remove_factor"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/mfa/passkeys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Start adding a passkey (biometric sign-in)
         * @description Needs a session signed in with two factors; answers the options to create it.
         */
        post: operations["start_passkey"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/mfa/passkeys/{factor_id}/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Finish adding the passkey
         * @description Checks the new passkey; it is then a second factor (audited).
         */
        post: operations["verify_passkey"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/mfa/passkeys/challenge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * The options to confirm with a passkey
         * @description For the sign-in's second step or a step-up; any passkey of the user will do.
         */
        post: operations["challenge_passkey"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/mfa/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Finish setting up the authenticator app
         * @description Checks the first code; the session is then signed in with two factors.
         */
        post: operations["verify_mfa_enrollment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/password/forgot": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ask for a password reset email
         * @description Emails a link to set a new password, if an account exists for the email. The answer
         *     never says whether it does.
         */
        post: operations["request_password_reset"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/password/reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Set a new password from a reset link and sign in
         * @description Sets the new password with Supabase Auth, starts a server-side session exactly like a
         *     sign-in (same cookie, `no-store`) and signs out every other session of the user.
         */
        post: operations["reset_password"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The current web session
         * @description Who is signed in on this browser, and how strongly.
         */
        get: operations["current_session"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * This user's signed-in devices
         * @description Active sessions, newest activity first; `current` marks this browser.
         */
        get: operations["list_web_sessions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/sessions/{session_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Sign out another device
         * @description Ends that session here and at Supabase; the device is signed out on its next request.
         */
        delete: operations["revoke_web_session"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/sign-in": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Sign in to the web app
         * @description Checks the password with Supabase Auth and starts a server-side session.
         */
        post: operations["sign_in_web"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/sign-out": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Sign out of the web app
         * @description Ends the session here and at Supabase Auth, and clears the cookie.
         */
        post: operations["sign_out_web"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/step-up": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Confirm it is you with a code
         * @description Re-entering a code allows sensitive actions for the next ten minutes.
         */
        post: operations["confirm_step_up"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/step-up/passkey": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Confirm it is you with a passkey
         * @description The session becomes `aal2` and counts as re-authenticated for ten minutes.
         */
        post: operations["confirm_with_passkey"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/automations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The office's automations
         * @description The current version of every automation, from the reviewed registry.
         */
        get: operations["list_automations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/automations/{automation_id}/executions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Executions of an automation in an organization
         * @description Newest first; pass `next_cursor` back as `cursor` for the next page.
         */
        get: operations["list_automation_executions"];
        put?: never;
        /**
         * Start an automation (a user action)
         * @description Creates the execution once per Idempotency-Key; the worker runs it.
         */
        post: operations["start_automation_execution"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/automations/{automation_id}/executions/{execution_id}/retry": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Retry a dead-lettered execution
         * @description The same execution goes back to its retry with a new job; audited.
         */
        post: operations["retry_automation_execution"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/executions/{execution_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * One execution with its trigger, actions, approvals and events
         * @description In causal order; IDs, states and codes only, never payloads or buyer data. The run's
         *     checked output (per-run counts) is shown to the Owner and Admins.
         */
        get: operations["get_execution_chain"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/incidents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The organization's incidents the caller may view
         * @description Newest first; a shop-scoped role sees its granted shops' incidents only.
         *     `shop_id` and `receipt_id` narrow the list to one shop or one order; pass
         *     `next_cursor` back as `cursor` for the next page.
         */
        get: operations["get_incidents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/incidents/{incident_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** One incident with its history and evidence */
        get: operations["get_incident"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/incidents/{incident_id}/transitions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Move an incident one step along its machine */
        post: operations["move_incident"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/integrations/etsy/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Finish connecting an Etsy shop
         * @description Exchanges the code, stores the tokens sealed, creates or updates the shop (one per
         *     Etsy shop and organization), grants the connecting Owner, and audits the connection.
         */
        post: operations["complete_etsy_connection"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The signed-in user and their organizations
         * @description Who the caller is, how strongly they signed in, and their role in each organization.
         */
        get: operations["me"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** The caller's notifications in the organization */
        get: operations["get_notifications"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notifications/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Mark the caller's notifications read */
        post: operations["read_notifications"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/operations/dead-letters/{job_id}/retry": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Send a dead-lettered job back to the queue (audited)
         * @description Attempts start from zero and the job is due now; the audit records its kind and last
         *     error.
         */
        post: operations["retry_dead_letter"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/operations/email-failures": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Emails refused for good or skipped (no full address)
         * @description Newest first; the recipient as a member ID and a masked address; pass `next_cursor`
         *     back as `cursor` for the next page.
         */
        get: operations["list_email_failures"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/operations/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Queue, execution and sync health
         * @description The Owner and Admins: IDs, states, counts, times and error codes, never payloads.
         */
        get: operations["get_operations_health"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/organizations/{organization_id}/invitations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Invite a user by email
         * @description Adds the membership and returns a one-time invitation link to send to the invitee
         *     (`no-store`; never logged). Only the Owner may invite another Owner.
         */
        post: operations["invite_organization_member"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/organizations/{organization_id}/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The organization's members
         * @description Active members with their role and granted shops. Owner and Admin, with MFA.
         */
        get: operations["list_organization_members"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/organizations/{organization_id}/members/{membership_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Remove a member
         * @description Takes effect on the member's next request. The Owner cannot be removed.
         */
        delete: operations["remove_organization_member"];
        options?: never;
        head?: never;
        /**
         * Change a member's role
         * @description The Owner's membership cannot be changed; only the Owner may grant the Owner role.
         */
        patch: operations["change_member_role"];
        trace?: never;
    };
    "/v1/organizations/{organization_id}/members/{membership_id}/shops/{shop_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Grant a member access to a shop
         * @description Idempotent: granting an existing grant changes nothing.
         */
        put: operations["grant_member_shop"];
        post?: never;
        /**
         * Revoke a member's access to a shop
         * @description Takes effect on the member's next request.
         */
        delete: operations["revoke_member_shop"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/relay-items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The open AutoVA relay items of the caller's shops
         * @description Oldest first: each order waiting for its tracking from AutoVA (slice 6.10), in pages
         *     of 200; pass `next_cursor` back as `cursor` for the next page.
         */
        get: operations["get_relay_items"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/relay-items/{item_id}/code": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The pasted tracking number, for the person who copies it into Etsy
         * @description An Owner or Admin with a second factor; every reveal audited
         *     (`relay.code_revealed`, never the code); never cached. Anyone else, or an item that
         *     closed or expired, gets a 404 that never says whether a code exists.
         */
        get: operations["get_relay_code"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/relay-items/{item_id}/tracking": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Paste the tracking number from AutoVA for one relay item
         * @description An Owner or Admin with a second factor (6.10 PR B). Validated before anything else
         *     (AC-6.10.4); a number the Etsy receipt already carries closes the item on that evidence
         *     (AC-6.10.2); otherwise the item is handed off for the copy into Etsy (AC-6.10.3). Replay
         *     safe: a second paste is a 409. Audited, never with the number; no Etsy call.
         */
        post: operations["paste_tracking"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shop-integrations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Marketplace connections of the organization's shops
         * @description Status, granted scopes and token health per shop, and Etsy's remaining daily request
         *     budget with its floor, for the shop card; never a token.
         */
        get: operations["list_shop_integrations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shop-integrations/{shop_id}/capability-checks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Re-check what HTCO may do with a connected shop
         * @description Read-only probes: the shop, one receipt (address fields checked for presence only),
         *     one listing. Shipment write permission is never probed and stays `unknown`.
         */
        post: operations["check_shop_capabilities"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shop-integrations/{shop_id}/disconnect": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Disconnect a shop
         * @description Deletes the tokens, marks the shop disconnected with a purge date 30 days ahead and
         *     audits it; no Etsy call is made for the shop afterwards. Repeating it changes nothing.
         */
        post: operations["disconnect_etsy_shop"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shops": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The shops the caller may see
         * @description Ordered by creation; Owner and Admin see every shop, other roles their granted shops.
         */
        get: operations["shops"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shops/{shop_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Remove a shop and every piece of data stored about it
         * @description Disconnects the shop (its tokens are deleted) and deletes at once its stored order
         *     history (orders, items, refunds, buyers, sync state), its capability results, its
         *     members' grants and the shop itself, in one transaction, then audits it without buyer
         *     data. Nothing is sent to Etsy. Cannot be undone; repeating it answers 404.
         */
        delete: operations["remove_etsy_shop"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shops/{shop_id}/browser-environment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The status of the shop's browser environment
         * @description The status only; never the profile, the consent or any credential.
         */
        get: operations["get_browser_environment"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shops/{shop_id}/listings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The shop's active listings, live from the marketplace
         * @description Images, price, stock, views, favourites, tags and sections; up to 300 listings.
         */
        get: operations["list_shop_listings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shops/{shop_id}/order-exports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * The filtered or selected orders as CSV (audited)
         * @description Newest first, as the Orders screen lists them. Buyer name, address and tracking
         *     columns only for Owner, Admin, Operations and Support; for other roles they are left
         *     out. Cells that would start a spreadsheet formula begin with an apostrophe. Never cached.
         */
        post: operations["export_shop_orders"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shops/{shop_id}/order-resyncs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Re-read the selected orders from Etsy (queued, audited)
         * @description One Etsy Order Intake re-read per receipt, queued for the worker (GET-only, through
         *     the engine and the Action Gateway). Owner and Admin, and Operations and Developer for
         *     their granted shops. At most 50 receipts a request; audited with the receipt IDs.
         */
        post: operations["resync_shop_orders"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shops/{shop_id}/order-sync": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Start a sync of the shop's stored order history now
         * @description The backfill from its checkpoint (or from the start), then the last 30 days; Etsy is
         *     only read. Audited with the trigger only. Answers at once; the run goes on in the
         *     background and one runs per shop at a time.
         */
        post: operations["start_order_sync"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shops/{shop_id}/orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The shop's orders of a period: the stored orders once synced, live until then
         * @description Newest first, every state (completed and shipped included). `period`: `30d` (the
         *     default), `90d`, `12m` or `all`; up to `cap` orders a period (500, 1,000, 2,000, 2,000).
         *     Buyer display names and tracking numbers only for Owner, Admin, Operations and Support;
         *     never cached by the browser.
         */
        get: operations["list_shop_orders"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shops/{shop_id}/orders/{order_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * One order of the shop with its status timeline
         * @description The order as on the Orders screen, plus every recorded state change with its source,
         *     oldest first. From the stored history; an order not stored yet comes from the live
         *     30-day read with an empty timeline. Buyer details as on the list; never cached.
         */
        get: operations["get_shop_order"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shops/{shop_id}/overview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The shop's profile and sales: the stored orders once synced, live until then
         * @description Every role that sees the shop. Sales count paid orders that were not cancelled or
         *     fully refunded, by the day they were placed at `utc_offset_minutes` from UTC.
         */
        get: operations["get_shop_overview"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shops/{shop_id}/reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The shop's newest reviews, live from the marketplace
         * @description The newest 25 reviews, the shop's average and count, and the stars of the newest 100.
         */
        get: operations["list_shop_reviews"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shops/{shop_id}/shipping": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The shop's shipping profiles and policies, live from the marketplace
         * @description Shipping profiles with destinations and costs, return policies, production partners.
         */
        get: operations["get_shop_shipping"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shops/{shop_id}/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The shop's statistics since it opened: stored orders once synced, else live
         * @description Every role that sees the shop: Etsy's counts (opened, total sales, reviews,
         *     favourites, listings) and the aggregates of the order history read (up to 2,000 orders;
         *     `partial` says the cap was hit), with months at `utc_offset_minutes` from UTC. No buyer
         *     data.
         */
        get: operations["get_shop_stats"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/shops/etsy/connect": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Start connecting an Etsy shop
         * @description Answers Etsy's authorization URL (PKCE S256, a single-use state bound to this
         *     session for ten minutes). Requested scopes: shops_r, transactions_r, listings_r.
         */
        post: operations["connect_etsy_shop"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/webhooks/etsy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Receive an Etsy webhook
         * @description Etsy's signed event (Standard Webhooks). Off unless enabled on the server.
         */
        post: operations["receive_etsy_webhook"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** AcceptInvitationRequest */
        AcceptInvitationRequest: {
            /** Access Token */
            access_token: string;
            /** Password */
            password: string;
            /** Refresh Token */
            refresh_token: string;
        };
        /**
         * ActorKind
         * @enum {string}
         */
        ActorKind: "user" | "employee" | "automation" | "advisor" | "system";
        /** AllTimeSalesView */
        AllTimeSalesView: {
            average_order_value: components["schemas"]["MoneyView"] | null;
            best_month: components["schemas"]["MonthlySalesView"] | null;
            /** Countries */
            countries: components["schemas"]["CountryOrdersView"][];
            /** Currency */
            currency: string;
            /** Customers */
            customers?: number | null;
            /** First Order At */
            first_order_at: string | null;
            /** Monthly */
            monthly: components["schemas"]["MonthlySalesView"][];
            /** Orders */
            orders: number;
            /** Partial */
            partial: boolean;
            /** Receipts Read */
            receipts_read: number;
            /**
             * Refunds And Cancellations
             * @default []
             */
            refunds_and_cancellations: components["schemas"]["ReasonCountView"][];
            /** Repeat Customers Percent */
            repeat_customers_percent?: string | null;
            revenue: components["schemas"]["MoneyView"];
            /** Top Products */
            top_products: components["schemas"]["TopListingView"][];
            /** Units */
            units: number;
        };
        /** AssuranceView */
        AssuranceView: {
            /** Assurance */
            assurance: string;
        };
        /** AuditEntryView */
        AuditEntryView: {
            /** Action */
            action: string;
            /** Actor Id */
            actor_id: string;
            /** Actor Kind */
            actor_kind: string;
            /** After */
            after: {
                [key: string]: unknown;
            } | null;
            /** Before */
            before: {
                [key: string]: unknown;
            } | null;
            /** Correlation Id */
            correlation_id: string | null;
            /** Entity Id */
            entity_id: string;
            /** Entity Type */
            entity_type: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Occurred At
             * Format: date-time
             */
            occurred_at: string;
        };
        /** AuditLogPage */
        AuditLogPage: {
            /** Items */
            items: components["schemas"]["AuditEntryView"][];
            /** Next Cursor */
            next_cursor: string | null;
        };
        /** AuthorizationView */
        AuthorizationView: {
            /** Authorization Url */
            authorization_url: string;
        };
        /** AutomationList */
        AutomationList: {
            /** Items */
            items: components["schemas"]["AutomationView"][];
        };
        /** AutomationMetricsView */
        AutomationMetricsView: {
            /** Automation Id */
            automation_id: string;
            /** Dead Lettered */
            dead_lettered: number;
            /** Executions */
            executions: number;
            /** P50 Seconds */
            p50_seconds: number | null;
            /** P95 Seconds */
            p95_seconds: number | null;
            /** Retries */
            retries: number;
            /** Succeeded */
            succeeded: number;
            /** Success Rate */
            success_rate: string | null;
        };
        /** AutomationView */
        AutomationView: {
            /** Activation Phase */
            activation_phase: number;
            /** Approval Required */
            approval_required: boolean;
            /** Business Owner */
            business_owner: string;
            /** Callable From */
            callable_from: string[];
            /** Id */
            id: string;
            /** Name */
            name: string;
            /** Primary Trigger */
            primary_trigger: string;
            /** Readiness */
            readiness: string;
            /** Side Effect */
            side_effect: string;
            /** User Triggerable */
            user_triggerable: boolean;
            /** Version */
            version: number;
        };
        /** BrowserEnvironmentView */
        BrowserEnvironmentView: {
            /**
             * Shop Id
             * Format: uuid
             */
            shop_id: string;
            /** Status */
            status: string;
        };
        /** CapabilityCheckView */
        CapabilityCheckView: {
            /** Capabilities */
            capabilities: components["schemas"]["CapabilityView"][];
            /**
             * Shop Id
             * Format: uuid
             */
            shop_id: string;
        };
        /**
         * CapabilityState
         * @enum {string}
         */
        CapabilityState: "available" | "unavailable" | "unknown";
        /** CapabilityView */
        CapabilityView: {
            capability: components["schemas"]["ShopCapability"];
            /**
             * Checked At
             * Format: date-time
             */
            checked_at: string;
            /** Detail */
            detail: string;
            state: components["schemas"]["CapabilityState"];
        };
        /** ChainEntryView */
        ChainEntryView: {
            /**
             * At
             * Format: date-time
             */
            at: string;
            /** Detail */
            detail: {
                [key: string]: unknown;
            };
            /** Id */
            id: string;
            /** Kind */
            kind: string;
            /** Name */
            name: string;
            /** State */
            state: string | null;
            /** Status */
            status: string | null;
        };
        /**
         * CheckStatus
         * @enum {string}
         */
        CheckStatus: "ok" | "failed";
        /** ConnectedShopView */
        ConnectedShopView: {
            integration: components["schemas"]["IntegrationView"];
            /** Reconnected */
            reconnected: boolean;
            shop: components["schemas"]["ShopView"];
        };
        /** CountryOrdersView */
        CountryOrdersView: {
            /** Country */
            country: string;
            /** Orders */
            orders: number;
        };
        /** DailySalesView */
        DailySalesView: {
            /**
             * Date
             * Format: date
             */
            date: string;
            /** Orders */
            orders: number;
            /** Revenue */
            revenue: string;
        };
        /**
         * DataSource
         * @description Where a result comes from: Etsy live, or HTCO's stored order history.
         * @enum {string}
         */
        DataSource: "etsy_live" | "htco_store";
        /** DeadJobView */
        DeadJobView: {
            /** Attempts */
            attempts: number;
            /** Execution Id */
            execution_id: string | null;
            /**
             * Finished At
             * Format: date-time
             */
            finished_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Kind */
            kind: string;
            /** Last Error */
            last_error: string | null;
            /** Shop Id */
            shop_id: string | null;
        };
        /** DestinationView */
        DestinationView: {
            additional_item: components["schemas"]["MoneyView"];
            /** Country */
            country: string | null;
            first_item: components["schemas"]["MoneyView"];
            /** Mail Class */
            mail_class: string | null;
            /** Max Delivery Days */
            max_delivery_days: number | null;
            /** Min Delivery Days */
            min_delivery_days: number | null;
            /** Region */
            region: string | null;
        };
        /** EnrollmentView */
        EnrollmentView: {
            /** Factor Id */
            factor_id: string;
            /** Qr Code */
            qr_code: string;
            /** Secret */
            secret: string;
            /** Uri */
            uri: string;
        };
        /** EnrollRequest */
        EnrollRequest: {
            /**
             * Name
             * @default Authenticator app
             */
            name: string;
        };
        /** EtsyCallback */
        EtsyCallback: {
            /** Code */
            code: string;
            /** State */
            state?: string | null;
        };
        /** EtsyQuotaView */
        EtsyQuotaView: {
            /** Below Floor */
            below_floor: boolean;
            /** Floor */
            floor: number;
            /** Limit Per Day */
            limit_per_day: number | null;
            /** Observed At */
            observed_at: string | null;
            /** Remaining Today */
            remaining_today: number | null;
        };
        /** EvidenceView */
        EvidenceView: {
            /** Kind */
            kind: string;
            /**
             * Observed At
             * Format: date-time
             */
            observed_at: string;
            /** Reference */
            reference: string;
            /** Source */
            source: string;
        };
        /** ExecutionChainView */
        ExecutionChainView: {
            /** Automation Id */
            automation_id: string;
            /** Correlation Id */
            correlation_id: string;
            /** Entries */
            entries: components["schemas"]["ChainEntryView"][];
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Output */
            output?: {
                [key: string]: unknown;
            } | null;
            /** Shop Id */
            shop_id: string | null;
            /** State */
            state: string;
            /** Status */
            status: string;
        };
        /** ExecutionList */
        ExecutionList: {
            /** Items */
            items: components["schemas"]["ExecutionView"][];
            /** Next Cursor */
            next_cursor: string | null;
        };
        /** ExecutionRowView */
        ExecutionRowView: {
            /** Attempts */
            attempts: number;
            /** Automation Id */
            automation_id: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Last Error */
            last_error: string | null;
            /** Shop Id */
            shop_id: string | null;
            /** State */
            state: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** ExecutionView */
        ExecutionView: {
            /** Actor Id */
            actor_id: string;
            /** Actor Kind */
            actor_kind: string;
            /** Attempts */
            attempts: number;
            /** Automation Id */
            automation_id: string;
            /** Automation Version */
            automation_version: number;
            /** Correlation Id */
            correlation_id: string;
            /** Created At */
            created_at?: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Last Error */
            last_error: string | null;
            /** Shop Id */
            shop_id: string | null;
            /** State */
            state: string;
            /** Trigger */
            trigger: string;
            /** Updated At */
            updated_at?: string | null;
        };
        /** ExportOrdersRequest */
        ExportOrdersRequest: {
            /** Order Ids */
            order_ids?: number[];
            /** @default 30d */
            period: components["schemas"]["OrderPeriod"];
            state?: components["schemas"]["OrderFilter"] | null;
        };
        /** FactorView */
        FactorView: {
            /** Id */
            id: string;
            /** Kind */
            kind: string;
            /** Name */
            name: string | null;
            /** Verified */
            verified: boolean;
        };
        /** FailedEmailList */
        FailedEmailList: {
            /** Items */
            items: components["schemas"]["FailedEmailView"][];
            /** Next Cursor */
            next_cursor: string | null;
        };
        /** FailedEmailView */
        FailedEmailView: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Incident Id */
            incident_id: string | null;
            /** Kind */
            kind: string;
            /** Reason */
            reason: string | null;
            /** Receipt Id */
            receipt_id: number | null;
            /** Recipient */
            recipient: string | null;
            /**
             * Recipient User Id
             * Format: uuid
             */
            recipient_user_id: string;
            /** Shop Id */
            shop_id: string | null;
            status: components["schemas"]["FailedStatus"];
        };
        /**
         * FailedStatus
         * @enum {string}
         */
        FailedStatus: "failed" | "skipped";
        /**
         * FieldError
         * @description One invalid request field: where it is and what is wrong. The input is never echoed.
         */
        FieldError: {
            /** Location */
            location: (string | number)[];
            /** Message */
            message: string;
        };
        /** ForgotPasswordRequest */
        ForgotPasswordRequest: {
            /** Email */
            email: string;
        };
        /** HealthStatus */
        HealthStatus: {
            /**
             * Status
             * @constant
             */
            status: "ok";
        };
        /** HistoryEntryView */
        HistoryEntryView: {
            /** Actor Id */
            actor_id: string;
            /** Actor Kind */
            actor_kind: string;
            /**
             * At
             * Format: date-time
             */
            at: string;
            evidence: components["schemas"]["EvidenceView"] | null;
            /** From State */
            from_state: string | null;
            /** Note */
            note: string | null;
            /** To State */
            to_state: string;
        };
        /**
         * HistoryState
         * @enum {string}
         */
        HistoryState: "syncing_history" | "complete";
        /** InboxView */
        InboxView: {
            /** Items */
            items: components["schemas"]["NotificationView"][];
            /** Unread Count */
            unread_count: number;
        };
        /** IncidentDetailView */
        IncidentDetailView: {
            /** Can Update */
            can_update: boolean;
            /** Cause */
            cause: string;
            /** Details */
            details: {
                [key: string]: unknown;
            };
            /**
             * Detected At
             * Format: date-time
             */
            detected_at: string;
            /** History */
            history: components["schemas"]["HistoryEntryView"][];
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is Open */
            is_open: boolean;
            /** Next States */
            next_states: string[];
            /** Receipt Id */
            receipt_id: number | null;
            /** Resolved At */
            resolved_at: string | null;
            /** Severity */
            severity: string;
            /** Shop Id */
            shop_id: string | null;
            /** Source */
            source: string;
            /** State */
            state: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** IncidentListView */
        IncidentListView: {
            /** Items */
            items: components["schemas"]["IncidentSummaryView"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /** IncidentSummaryView */
        IncidentSummaryView: {
            /** Cause */
            cause: string;
            /**
             * Detected At
             * Format: date-time
             */
            detected_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is Open */
            is_open: boolean;
            /** Receipt Id */
            receipt_id: number | null;
            /** Resolved At */
            resolved_at: string | null;
            /** Severity */
            severity: string;
            /** Shop Id */
            shop_id: string | null;
            /** Source */
            source: string;
            /** State */
            state: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * IngestSource
         * @enum {string}
         */
        IngestSource: "webhook" | "reconciliation" | "backfill" | "sync";
        /** IntegrationList */
        IntegrationList: {
            etsy_quota?: components["schemas"]["EtsyQuotaView"] | null;
            /** Items */
            items: components["schemas"]["IntegrationView"][];
        };
        /**
         * IntegrationProvider
         * @enum {string}
         */
        IntegrationProvider: "etsy";
        /**
         * IntegrationStatus
         * @enum {string}
         */
        IntegrationStatus: "connected" | "needs_reauth" | "disconnected";
        /** IntegrationView */
        IntegrationView: {
            /** Access Expires At */
            access_expires_at: string | null;
            /** Capabilities */
            capabilities?: components["schemas"]["CapabilityView"][];
            /**
             * Connected At
             * Format: date-time
             */
            connected_at: string;
            /** Disconnected At */
            disconnected_at?: string | null;
            /** Etsy Shop Id */
            etsy_shop_id: number;
            /** Failure Count */
            failure_count: number;
            /** Last Successful Call At */
            last_successful_call_at: string | null;
            provider: components["schemas"]["IntegrationProvider"];
            /** Purge After */
            purge_after?: string | null;
            /** Refresh Expires At */
            refresh_expires_at: string | null;
            /** Scopes */
            scopes: string[];
            /**
             * Shop Id
             * Format: uuid
             */
            shop_id: string;
            status: components["schemas"]["IntegrationStatus"];
            token_health: components["schemas"]["TokenHealth"];
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** Invitation */
        Invitation: {
            /** Email */
            email: string;
            role: components["schemas"]["Role"];
        };
        /** InvitationView */
        InvitationView: {
            /** Display Name */
            display_name: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Invite Link */
            invite_link: string | null;
            role: components["schemas"]["Role"];
            /** Shop Ids */
            shop_ids: string[];
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /** JobCountView */
        JobCountView: {
            /** Count */
            count: number;
            /** Kind */
            kind: string;
            /** State */
            state: string;
        };
        /**
         * ListingState
         * @enum {string}
         */
        ListingState: "active" | "inactive" | "sold_out" | "draft" | "expired";
        /** ListingsView */
        ListingsView: {
            /**
             * Fetched At
             * Format: date-time
             */
            fetched_at: string;
            /** Items */
            items: components["schemas"]["ListingView"][];
            /** Sections */
            sections: components["schemas"]["SectionView"][];
            /**
             * Shop Id
             * Format: uuid
             */
            shop_id: string;
            /** DataSource */
            source: string;
            /** Stale */
            stale: boolean;
            /** Total Count */
            total_count: number;
            /** Truncated */
            truncated: boolean;
        };
        /** ListingView */
        ListingView: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Favorer Count */
            favorer_count: number;
            /** Has Variations */
            has_variations: boolean;
            /** Image Alt */
            image_alt: string | null;
            /** Image Url */
            image_url: string | null;
            /** Is Digital */
            is_digital: boolean;
            /** Is Personalizable */
            is_personalizable: boolean;
            /** Listing Id */
            listing_id: number;
            price: components["schemas"]["MoneyView"];
            /** Quantity */
            quantity: number;
            /** Section Id */
            section_id: number | null;
            /** Section Title */
            section_title: string | null;
            state: components["schemas"]["ListingState"];
            /** Tags */
            tags: string[];
            /** Thumbnail Url */
            thumbnail_url: string | null;
            /** Title */
            title: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Url */
            url: string | null;
            /** Views */
            views: number;
        };
        /** MarkReadRequest */
        MarkReadRequest: {
            /** Ids */
            ids?: string[] | null;
        };
        /** Me */
        Me: {
            /**
             * Assurance
             * @enum {string}
             */
            assurance: "aal1" | "aal2";
            /** Memberships */
            memberships: components["schemas"]["MembershipView"][];
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /** MemberList */
        MemberList: {
            /** Items */
            items: components["schemas"]["MemberView"][];
        };
        /** MembershipView */
        MembershipView: {
            /**
             * Organization Id
             * Format: uuid
             */
            organization_id: string;
            role: components["schemas"]["Role"];
        };
        /** MemberView */
        MemberView: {
            /** Display Name */
            display_name: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            role: components["schemas"]["Role"];
            /** Shop Ids */
            shop_ids: string[];
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /** MfaView */
        MfaView: {
            /** Assurance */
            assurance: string;
            /** Enrolled */
            enrolled: boolean;
            /** Factors */
            factors: components["schemas"]["FactorView"][];
            /** Passkeys */
            passkeys: boolean;
        };
        /** MoneyView */
        MoneyView: {
            /** Amount */
            amount: string;
            /** Currency */
            currency: string;
        };
        /** MonthlySalesView */
        MonthlySalesView: {
            /**
             * Month
             * Format: date
             */
            month: string;
            /** Orders */
            orders: number;
            /** Revenue */
            revenue: string;
        };
        /** NotificationView */
        NotificationView: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Incident Id */
            incident_id: string | null;
            /** Kind */
            kind: string;
            /** Params */
            params: {
                [key: string]: string;
            };
            /** Read At */
            read_at: string | null;
            /** Shop Id */
            shop_id: string | null;
        };
        /** NotReadyProblem */
        NotReadyProblem: {
            /** Checks */
            checks: {
                [key: string]: components["schemas"]["CheckStatus"];
            };
            /** Detail */
            detail: string;
            /** Request Id */
            request_id: string | null;
            /** Status */
            status: number;
            /** Title */
            title: string;
            /** Type */
            type: string;
        };
        /**
         * ObservedVia
         * @enum {string}
         */
        ObservedVia: "webhook" | "schedule" | "relay";
        /** OperationsHealthView */
        OperationsHealthView: {
            /** Automations */
            automations: components["schemas"]["AutomationMetricsView"][];
            /** Dead Letters */
            dead_letters: components["schemas"]["DeadJobView"][];
            /** Executions */
            executions: components["schemas"]["ExecutionRowView"][];
            /**
             * Generated At
             * Format: date-time
             */
            generated_at: string;
            /** Jobs */
            jobs: components["schemas"]["JobCountView"][];
            /**
             * Organization Id
             * Format: uuid
             */
            organization_id: string;
            /** Outbox Failures */
            outbox_failures: components["schemas"]["OutboxFailureView"][];
            /** Shops */
            shops: components["schemas"]["ShopSyncView"][];
            /** Webhooks */
            webhooks: components["schemas"]["WebhookCountView"][];
            /** Workers */
            workers: components["schemas"]["WorkerView"][];
        };
        /** OrderCountsView */
        OrderCountsView: {
            /** Canceled */
            canceled: number;
            /** Overdue */
            overdue: number;
            /** Paid */
            paid: number;
            /** Refunded */
            refunded: number;
            /** Shipped */
            shipped: number;
            /** Unpaid */
            unpaid: number;
        };
        /** OrderDetailView */
        OrderDetailView: {
            /** Buyer Details */
            buyer_details: boolean;
            /**
             * Fetched At
             * Format: date-time
             */
            fetched_at: string;
            /** Last Synced At */
            last_synced_at?: string | null;
            order: components["schemas"]["OrderView"];
            /**
             * Shop Id
             * Format: uuid
             */
            shop_id: string;
            /** DataSource */
            source: string;
            /** Stale */
            stale: boolean;
            sync?: components["schemas"]["SyncView"] | null;
            /** Timeline */
            timeline: components["schemas"]["OrderStatusChangeView"][];
            /**
             * Tracking
             * @default []
             */
            tracking: components["schemas"]["OrderTrackingView"][];
        };
        /**
         * OrderFilter
         * @description The Orders screen's filters: every state, plus paid orders past their ship-by date.
         * @enum {string}
         */
        OrderFilter: "unpaid" | "paid" | "shipped" | "canceled" | "refunded" | "overdue";
        /** OrderItemView */
        OrderItemView: {
            /** Is Digital */
            is_digital: boolean;
            /** Listing Id */
            listing_id: number | null;
            /** Quantity */
            quantity: number;
            /** Sku */
            sku: string | null;
            /** Title */
            title: string;
            unit_price: components["schemas"]["MoneyView"];
        };
        /**
         * OrderPeriod
         * @description The Orders screen's periods. The longer ones read Etsy page by page, one page after the
         *     other, up to a cap (`RECEIPT_CAPS`).
         * @enum {string}
         */
        OrderPeriod: "30d" | "90d" | "12m" | "all";
        /**
         * OrderState
         * @enum {string}
         */
        OrderState: "unpaid" | "paid" | "ingested" | "awaiting_shipment" | "shipped" | "delivered" | "cancelled" | "refunded";
        /** OrderStatusChangeView */
        OrderStatusChangeView: {
            from_state: components["schemas"]["OrderState"] | null;
            /**
             * Observed At
             * Format: date-time
             */
            observed_at: string;
            source: components["schemas"]["IngestSource"];
            state: components["schemas"]["OrderViewState"];
            to_state: components["schemas"]["OrderState"];
        };
        /** OrdersView */
        OrdersView: {
            /** Buyer Details */
            buyer_details: boolean;
            /** Cap */
            cap: number;
            counts: components["schemas"]["OrderCountsView"];
            /**
             * Fetched At
             * Format: date-time
             */
            fetched_at: string;
            /** Items */
            items: components["schemas"]["OrderView"][];
            /** Last Synced At */
            last_synced_at?: string | null;
            /** Partial */
            partial: boolean;
            period: components["schemas"]["OrderPeriod"];
            /**
             * Shop Id
             * Format: uuid
             */
            shop_id: string;
            /** DataSource */
            source: string;
            /** Stale */
            stale: boolean;
            sync?: components["schemas"]["SyncView"] | null;
            /** Total */
            total: number;
            /**
             * Window Start
             * Format: date-time
             */
            window_start: string;
        };
        /** OrderTrackingView */
        OrderTrackingView: {
            /** Carrier */
            carrier: string;
            /** Carrier Name */
            carrier_name: string;
            /**
             * First Observed At
             * Format: date-time
             */
            first_observed_at: string;
            /** Last4 */
            last4: string;
            observed_via: components["schemas"]["ObservedVia"];
            source: components["schemas"]["TrackingSource"];
        };
        /** OrderView */
        OrderView: {
            /** Buyer */
            buyer: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            discount: components["schemas"]["MoneyView"];
            /** Items */
            items: components["schemas"]["OrderItemView"][];
            /** Order Id */
            order_id: number;
            /** Overdue */
            overdue: boolean;
            refunded_total?: components["schemas"]["MoneyView"] | null;
            /**
             * Refunds
             * @default []
             */
            refunds: components["schemas"]["RefundView"][];
            /** Ship By */
            ship_by: string | null;
            /** Shipments */
            shipments: components["schemas"]["ShipmentView"][];
            shipping: components["schemas"]["MoneyView"];
            state: components["schemas"]["OrderViewState"];
            subtotal: components["schemas"]["MoneyView"];
            total: components["schemas"]["MoneyView"];
            /** Units */
            units: number;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * OrderViewState
         * @description The Orders screen's five states: a view of the order store's state machine
         *     (`htco_domain.orders.OrderState`, FR-ORD-03), mapped by `ORDER_VIEW_STATES`. The API keeps
         *     Etsy's spelling `canceled`.
         * @enum {string}
         */
        OrderViewState: "unpaid" | "paid" | "shipped" | "canceled" | "refunded";
        /** OutboxFailureView */
        OutboxFailureView: {
            /** Action Execution Id */
            action_execution_id: string | null;
            /** Attempts */
            attempts: number;
            /** Destination */
            destination: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Last Error */
            last_error: string | null;
            /** Next Attempt At */
            next_attempt_at: string | null;
            /** Status */
            status: string;
        };
        /** PasskeyConfirmRequest */
        PasskeyConfirmRequest: {
            /** Challenge Id */
            challenge_id: string;
            /** Credential */
            credential: {
                [key: string]: unknown;
            };
            /** Factor Id */
            factor_id: string;
        };
        /** PasskeyOptionsView */
        PasskeyOptionsView: {
            /** Ceremony */
            ceremony: string;
            /** Challenge Id */
            challenge_id: string;
            /** Factor Id */
            factor_id: string;
            /** Options */
            options: {
                [key: string]: unknown;
            };
        };
        /** PasskeyStartRequest */
        PasskeyStartRequest: {
            /**
             * Name
             * @default Passkey
             */
            name: string;
        };
        /** PasskeyVerifyRequest */
        PasskeyVerifyRequest: {
            /** Challenge Id */
            challenge_id: string;
            /** Credential */
            credential: {
                [key: string]: unknown;
            };
        };
        /**
         * Problem
         * @description Problem details (RFC 9457) plus the request ID.
         */
        Problem: {
            /** Detail */
            detail: string;
            /** Request Id */
            request_id: string | null;
            /** Status */
            status: number;
            /** Title */
            title: string;
            /** Type */
            type: string;
        };
        /** ProductionPartnerView */
        ProductionPartnerView: {
            /** Location */
            location: string;
            /** Name */
            name: string;
            /** Partner Id */
            partner_id: number;
        };
        /** ReadinessStatus */
        ReadinessStatus: {
            /** Checks */
            checks: {
                [key: string]: components["schemas"]["CheckStatus"];
            };
            /**
             * Status
             * @constant
             */
            status: "ready";
        };
        /** ReasonCountView */
        ReasonCountView: {
            amount: components["schemas"]["MoneyView"];
            /** Kind */
            kind: string;
            /** Orders */
            orders: number;
            /** Reason */
            reason: string | null;
        };
        /** RefundView */
        RefundView: {
            amount: components["schemas"]["MoneyView"];
            /** Note */
            note: string | null;
            /** Reason */
            reason: string | null;
            /**
             * Refunded At
             * Format: date-time
             */
            refunded_at: string;
            /** Status */
            status: string | null;
        };
        /** RelayCodeView */
        RelayCodeView: {
            /** Code */
            code: string;
        };
        /** RelayItemListView */
        RelayItemListView: {
            /** Items */
            items: components["schemas"]["RelayItemView"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * RelayItemView
         * @description No code and nothing of it (the code is buyer data, revealed by the audited code route).
         */
        RelayItemView: {
            /** Closed Reason */
            closed_reason: ("tracking_on_etsy" | "uploaded" | "cancelled" | "expired") | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Opened At
             * Format: date-time
             */
            opened_at: string;
            /**
             * Paid At
             * Format: date-time
             */
            paid_at: string;
            /** Receipt Id */
            receipt_id: number;
            /**
             * Shop Id
             * Format: uuid
             */
            shop_id: string;
            /**
             * State
             * @enum {string}
             */
            state: "awaiting_tracking" | "handed_off" | "closed";
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * RelayPasteView
         * @description The item after a paste: the carrier and last four characters, never the code.
         */
        RelayPasteView: {
            /** Carrier */
            carrier: string | null;
            /** Closed Reason */
            closed_reason: "tracking_on_etsy" | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Last4 */
            last4: string | null;
            /**
             * Opened At
             * Format: date-time
             */
            opened_at: string;
            /**
             * Paid At
             * Format: date-time
             */
            paid_at: string;
            /** Receipt Id */
            receipt_id: number;
            /**
             * Shop Id
             * Format: uuid
             */
            shop_id: string;
            /**
             * State
             * @enum {string}
             */
            state: "handed_off" | "closed";
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** ResetPasswordRequest */
        ResetPasswordRequest: {
            /** Access Token */
            access_token: string;
            /** Code */
            code?: string | null;
            /** Password */
            password: string;
            /** Refresh Token */
            refresh_token: string;
        };
        /** ResyncOrdersRequest */
        ResyncOrdersRequest: {
            /** Order Ids */
            order_ids: number[];
        };
        /** ResyncOrdersView */
        ResyncOrdersView: {
            /** Queued */
            queued: number;
        };
        /** RetriedJobView */
        RetriedJobView: {
            /**
             * Job Id
             * Format: uuid
             */
            job_id: string;
            /** State */
            state: string;
        };
        /** RetryThroughExecutionProblem */
        RetryThroughExecutionProblem: {
            /** Detail */
            detail: string;
            /** Execution Id */
            execution_id: string | null;
            /** Request Id */
            request_id: string | null;
            /** Status */
            status: number;
            /** Title */
            title: string;
            /** Type */
            type: string;
        };
        /** ReturnPolicyView */
        ReturnPolicyView: {
            /** Accepts Exchanges */
            accepts_exchanges: boolean;
            /** Accepts Returns */
            accepts_returns: boolean;
            /** Policy Id */
            policy_id: number;
            /** Return Deadline Days */
            return_deadline_days: number | null;
        };
        /** ReviewsView */
        ReviewsView: {
            /** Average */
            average: string | null;
            /** Count */
            count: number;
            /** Distribution */
            distribution: components["schemas"]["StarCountView"][];
            /**
             * Fetched At
             * Format: date-time
             */
            fetched_at: string;
            /** Items */
            items: components["schemas"]["ReviewView"][];
            /** Sample Size */
            sample_size: number;
            /**
             * Shop Id
             * Format: uuid
             */
            shop_id: string;
            /** DataSource */
            source: string;
            /** Stale */
            stale: boolean;
        };
        /** ReviewView */
        ReviewView: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Language */
            language: string | null;
            /** Listing Id */
            listing_id: number;
            /** Rating */
            rating: number;
            /** Text */
            text: string | null;
        };
        /**
         * Role
         * @description Organization roles (FR-IAM-02). Owner and Admin act on every shop of the organization.
         * @enum {string}
         */
        Role: "owner" | "admin" | "operations" | "finance" | "support" | "developer" | "viewer";
        /** RoleChange */
        RoleChange: {
            role: components["schemas"]["Role"];
        };
        /** SalesPeriodView */
        SalesPeriodView: {
            /** Orders */
            orders: number;
            revenue: components["schemas"]["MoneyView"];
            /** Units */
            units: number;
        };
        /** SalesView */
        SalesView: {
            /** Awaiting Shipment */
            awaiting_shipment: number;
            /** Currency */
            currency: string;
            /** Daily */
            daily: components["schemas"]["DailySalesView"][];
            last_7_days: components["schemas"]["SalesPeriodView"];
            last_30_days: components["schemas"]["SalesPeriodView"];
            /** Overdue */
            overdue: number;
            /** Partial */
            partial: boolean;
            today: components["schemas"]["SalesPeriodView"];
            /** Top Listings */
            top_listings: components["schemas"]["TopListingView"][];
        };
        /** SectionView */
        SectionView: {
            /** Active Listing Count */
            active_listing_count: number;
            /** Section Id */
            section_id: number;
            /** Title */
            title: string;
        };
        /** SessionItem */
        SessionItem: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Current */
            current: boolean;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Last Seen At
             * Format: date-time
             */
            last_seen_at: string;
            /** User Agent */
            user_agent: string | null;
        };
        /** SessionList */
        SessionList: {
            /** Items */
            items: components["schemas"]["SessionItem"][];
        };
        /** SessionView */
        SessionView: {
            /** Assurance */
            assurance: string;
            /** User Id */
            user_id: string;
        };
        /** ShipmentView */
        ShipmentView: {
            /** Carrier */
            carrier: string;
            /**
             * Shipped At
             * Format: date-time
             */
            shipped_at: string;
            /** Tracking Code */
            tracking_code: string | null;
        };
        /** ShippingProfileView */
        ShippingProfileView: {
            /** Destinations */
            destinations: components["schemas"]["DestinationView"][];
            /** Origin Country */
            origin_country: string;
            /** Profile Id */
            profile_id: number;
            /** Profile Type */
            profile_type: string;
            /** Title */
            title: string | null;
            /** Upgrade Count */
            upgrade_count: number;
        };
        /** ShippingView */
        ShippingView: {
            /**
             * Fetched At
             * Format: date-time
             */
            fetched_at: string;
            /** Production Partners */
            production_partners: components["schemas"]["ProductionPartnerView"][];
            /** Profiles */
            profiles: components["schemas"]["ShippingProfileView"][];
            /** Return Policies */
            return_policies: components["schemas"]["ReturnPolicyView"][];
            /**
             * Shop Id
             * Format: uuid
             */
            shop_id: string;
            /** DataSource */
            source: string;
            /** Stale */
            stale: boolean;
        };
        /**
         * ShopCapability
         * @description What HTCO checks it may do with a connected shop, in the order the shop card shows them.
         * @enum {string}
         */
        ShopCapability: "granted_scopes" | "shop_details" | "receipts_read" | "buyer_address" | "listings_read" | "webhooks" | "shipment_write";
        /** ShopList */
        ShopList: {
            /** Items */
            items: components["schemas"]["ShopView"][];
            /** Next Cursor */
            next_cursor: string | null;
        };
        /**
         * ShopNotConnectedProblem
         * @description `shop-not-connected` says why: `needs_reauth` (reconnect the shop: Etsy refused its tokens,
         *     or they belong to a replaced app key), `disconnected` or `not_connected`. Other problems on
         *     the same status carry no reason.
         */
        ShopNotConnectedProblem: {
            /** Detail */
            detail: string;
            /** Reason */
            reason?: string | null;
            /** Request Id */
            request_id: string | null;
            /** Status */
            status: number;
            /** Title */
            title: string;
            /** Type */
            type: string;
        };
        /** ShopOverviewView */
        ShopOverviewView: {
            /**
             * Fetched At
             * Format: date-time
             */
            fetched_at: string;
            /** Last Synced At */
            last_synced_at?: string | null;
            profile: components["schemas"]["ShopProfileView"];
            sales: components["schemas"]["SalesView"] | null;
            sales_source?: string | null;
            /**
             * Shop Id
             * Format: uuid
             */
            shop_id: string;
            /** DataSource */
            source: string;
            /** Stale */
            stale: boolean;
            sync?: components["schemas"]["SyncView"] | null;
        };
        /** ShopProfileView */
        ShopProfileView: {
            /** Accepts Custom Requests */
            accepts_custom_requests: boolean;
            /** Active Listing Count */
            active_listing_count: number;
            /** Banner Url */
            banner_url: string | null;
            /** Currency */
            currency: string;
            /** Digital Listing Count */
            digital_listing_count: number;
            /** Etsy Shop Id */
            etsy_shop_id: number;
            /** Favorer Count */
            favorer_count: number;
            /** Icon Url */
            icon_url: string | null;
            /** Is Vacation */
            is_vacation: boolean;
            /** Languages */
            languages: string[];
            /** Location Country */
            location_country: string | null;
            /** Name */
            name: string;
            /**
             * Opened At
             * Format: date-time
             */
            opened_at: string;
            /** Review Average */
            review_average: string | null;
            /** Review Count */
            review_count: number | null;
            /** Ships From Country */
            ships_from_country: string | null;
            /** Sold Count */
            sold_count: number;
            /** Title */
            title: string | null;
            /** Url */
            url: string | null;
        };
        /** ShopStatsView */
        ShopStatsView: {
            /**
             * Fetched At
             * Format: date-time
             */
            fetched_at: string;
            /** Last Synced At */
            last_synced_at?: string | null;
            profile: components["schemas"]["ShopProfileView"];
            sales: components["schemas"]["AllTimeSalesView"] | null;
            /**
             * Shop Id
             * Format: uuid
             */
            shop_id: string;
            /** DataSource */
            source: string;
            /** Stale */
            stale: boolean;
            sync?: components["schemas"]["SyncView"] | null;
        };
        /** ShopSyncView */
        ShopSyncView: {
            /** Drifts Last Day */
            drifts_last_day: number;
            /** Drifts Total */
            drifts_total: number;
            /** Kind */
            kind: string;
            /** Last Error */
            last_error: string | null;
            /** Last Started At */
            last_started_at: string | null;
            /** Last Succeeded At */
            last_succeeded_at: string | null;
            /** Resource */
            resource: string;
            /**
             * Shop Id
             * Format: uuid
             */
            shop_id: string;
            /** Stale */
            stale: boolean;
        };
        /** ShopView */
        ShopView: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Marketplace */
            marketplace: string;
            /** Name */
            name: string;
            /**
             * Organization Id
             * Format: uuid
             */
            organization_id: string;
            /** Status */
            status: string;
        };
        /** SignInRequest */
        SignInRequest: {
            /** Email */
            email: string;
            /** Password */
            password: string;
        };
        /** StarCountView */
        StarCountView: {
            /** Count */
            count: number;
            /** Stars */
            stars: number;
        };
        /** StepUpRequest */
        StepUpRequest: {
            /** Code */
            code: string;
        };
        /** SyncView */
        SyncView: {
            /** Last Synced At */
            last_synced_at: string | null;
            /** Orders Stored */
            orders_stored: number;
            state: components["schemas"]["HistoryState"];
        };
        /**
         * TokenHealth
         * @enum {string}
         */
        TokenHealth: "ok" | "expiring" | "needs_reauth" | "disconnected";
        /** TopListingView */
        TopListingView: {
            /** Listing Id */
            listing_id: number;
            revenue: components["schemas"]["MoneyView"];
            /** Title */
            title: string;
            /** Units */
            units: number;
        };
        /** TrackingPaste */
        TrackingPaste: {
            /** Carrier */
            carrier: string;
            /** Code */
            code: string;
        };
        /**
         * TrackingSource
         * @description Where the tracking number came from.
         * @enum {string}
         */
        TrackingSource: "etsy" | "autova_manual" | "autova_browser" | "autova_email";
        /** TransitionRequest */
        TransitionRequest: {
            /** Note */
            note?: string | null;
            /**
             * To State
             * @enum {string}
             */
            to_state: "triaged" | "investigating" | "remediation_proposed" | "auto_remediating" | "approval_required" | "developer_required" | "verifying" | "escalated" | "resolved";
        };
        /** TriggerBody */
        TriggerBody: {
            /** Organization Id */
            organization_id?: string | null;
            /** Payload */
            payload?: {
                [key: string]: unknown;
            };
            /** Shop Id */
            shop_id?: string | null;
        };
        /** ValidationProblem */
        ValidationProblem: {
            /** Detail */
            detail: string;
            /** Errors */
            errors: components["schemas"]["FieldError"][];
            /** Request Id */
            request_id: string | null;
            /** Status */
            status: number;
            /** Title */
            title: string;
            /** Type */
            type: string;
        };
        /** VerifyRequest */
        VerifyRequest: {
            /** Code */
            code: string;
            /** Factor Id */
            factor_id: string;
        };
        /** WebhookCountView */
        WebhookCountView: {
            /** Event Type */
            event_type: string;
            /** Received Last Day */
            received_last_day: number;
            /** Source */
            source: string;
            /** Unprocessed */
            unprocessed: number;
        };
        /** WorkerView */
        WorkerView: {
            /** Age Seconds */
            age_seconds: number;
            /** Alive */
            alive: boolean;
            /** Current Job Id */
            current_job_id: string | null;
            /**
             * Last Beat At
             * Format: date-time
             */
            last_beat_at: string;
            /** Release */
            release: string | null;
            /**
             * Started At
             * Format: date-time
             */
            started_at: string;
            /** Stopping */
            stopping: boolean;
            /** Worker Id */
            worker_id: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    healthz: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthStatus"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    readyz: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReadinessStatus"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description A dependency is not ready */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["NotReadyProblem"];
                };
            };
        };
    };
    list_audit_log: {
        parameters: {
            query?: {
                action?: string | null;
                actor_id?: string | null;
                actor_kind?: components["schemas"]["ActorKind"] | null;
                cursor?: string | null;
                limit?: number;
                organization_id?: string | null;
                shop_id?: string | null;
                since?: string | null;
                until?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuditLogPage"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Only the Owner and Admins read the audit log (forbidden) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The named organization does not exist for the caller */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid filter, time range, limit or cursor */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not available on this server (audit-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    accept_web_invitation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AcceptInvitationRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionView"];
                };
            };
            /** @description The body is not valid JSON */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The invitation link is invalid, expired or already used */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The request did not come from the web app */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Missing tokens or a password of the wrong length (validation-error), a password the sign-in service calls weak (weak-password), or the current password (same-password) */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Too many failed attempts; see Retry-After */
            429: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    get_mfa_status: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MfaView"];
                };
            };
            /** @description Not signed in */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    start_mfa_enrollment: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EnrollRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EnrollmentView"];
                };
            };
            /** @description The body is not valid JSON */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The request did not come from the web app */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid name or code */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    remove_factor: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                factor_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not signed in, or the passkey was refused */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not from the web app, or confirm with your second factor first */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Passkeys are not available here, or no such factor */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The last factor, or the last authenticator app */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid factor ID */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Too many refused passkeys or codes; see Retry-After */
            429: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    start_passkey: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasskeyStartRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PasskeyOptionsView"];
                };
            };
            /** @description The body is not valid JSON */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the passkey was refused */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not from the web app, or confirm with your second factor first */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Passkeys are not available here, or no such factor */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid name */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Too many refused passkeys or codes; see Retry-After */
            429: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    verify_passkey: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                factor_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasskeyVerifyRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssuranceView"];
                };
            };
            /** @description The body is not valid JSON */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the passkey was refused */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not from the web app, or confirm with your second factor first */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Passkeys are not available here, or no such factor */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid factor ID, challenge or credential */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Too many refused passkeys or codes; see Retry-After */
            429: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    challenge_passkey: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PasskeyOptionsView"];
                };
            };
            /** @description Not signed in, or the passkey was refused */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not from the web app, or confirm with your second factor first */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Passkeys are not available here, or no such factor */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No passkey is set up */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Too many refused passkeys or codes; see Retry-After */
            429: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    verify_mfa_enrollment: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssuranceView"];
                };
            };
            /** @description The body is not valid JSON */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the code is wrong */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The request did not come from the web app */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid name or code */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Too many wrong codes; see Retry-After */
            429: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    request_password_reset: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ForgotPasswordRequest"];
            };
        };
        responses: {
            /** @description Accepted; the same answer whether or not the account exists */
            202: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The body is not valid JSON */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The request did not come from the web app */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Missing or malformed email */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Too many requests for this email or from this address; see Retry-After */
            429: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Password reset is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    reset_password: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetPasswordRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionView"];
                };
            };
            /** @description The body is not valid JSON */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The reset link is invalid, expired or already used (reset-link-refused), or the authenticator code is wrong (mfa-code-refused) */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The request did not come from the web app (csrf-failed), or the user has an authenticator app and must send its code (mfa-code-required) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Missing tokens, a password of the wrong length or a malformed code (validation-error), a password the sign-in service calls weak (weak-password), or the current password (same-password) */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Too many failed attempts; see Retry-After */
            429: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    current_session: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionView"];
                };
            };
            /** @description Not signed in */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_web_sessions: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionList"];
                };
            };
            /** @description Not signed in */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    revoke_web_session: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not signed in */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The request did not come from the web app */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such session of this user */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid session ID */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    sign_in_web: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SignInRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionView"];
                };
            };
            /** @description The body is not valid JSON */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Wrong email or password */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The request did not come from the web app */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Missing email or password */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Too many failed sign-ins; see Retry-After */
            429: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    sign_out_web: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The request did not come from the web app */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    confirm_step_up: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StepUpRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The body is not valid JSON */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the code is wrong */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The request did not come from the web app */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No authenticator app is set up */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid name or code */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Too many wrong codes; see Retry-After */
            429: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    confirm_with_passkey: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasskeyConfirmRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The body is not valid JSON */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the passkey was refused */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not from the web app, or confirm with your second factor first */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Passkeys are not available here, or no such factor */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid challenge or credential */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Too many refused passkeys or codes; see Retry-After */
            429: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_automations: {
        parameters: {
            query?: {
                organization_id?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutomationList"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The role may not view the office (forbidden) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The named organization does not exist for the caller */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid organization ID */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Automations are not set up on this server (automations-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_automation_executions: {
        parameters: {
            query?: {
                cursor?: string | null;
                limit?: number;
                organization_id?: string | null;
            };
            header?: never;
            path: {
                automation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExecutionList"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The role may not view the office (forbidden) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The named organization does not exist for the caller */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid organization ID, limit or cursor */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Automations are not set up on this server (automations-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    start_automation_execution: {
        parameters: {
            query?: never;
            header: {
                /** @description A key for this request; a retry with the same key and body returns the first response (24 hours). */
                "Idempotency-Key": string;
            };
            path: {
                automation_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TriggerBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExecutionView"];
                };
            };
            /** @description No or an invalid Idempotency-Key, or several organizations and none named */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The role lacks the automation's capability (forbidden, mfa-required, step-up-required) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such automation or shop for the caller */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The automation cannot run (automation-refused), or the first request with this Idempotency-Key still runs (idempotency-in-progress) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid body, or the Idempotency-Key was used with another request (idempotency-key-reused) */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Automations are off on this server (automations-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    retry_automation_execution: {
        parameters: {
            query?: {
                organization_id?: string | null;
            };
            header?: never;
            path: {
                automation_id: string;
                execution_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExecutionView"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Only the Owner and Admins retry (forbidden) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such execution for the caller */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The execution is not dead-lettered (execution-not-dead-lettered) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid IDs */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Automations are off on this server (automations-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    get_execution_chain: {
        parameters: {
            query?: {
                organization_id?: string | null;
            };
            header?: never;
            path: {
                execution_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExecutionChainView"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The role may not view the office (forbidden) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such execution for the caller */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid execution or organization ID */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Executions cannot be read on this server (executions-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    get_incidents: {
        parameters: {
            query?: {
                cursor?: string | null;
                limit?: number;
                organization_id?: string | null;
                receipt_id?: number | null;
                shop_id?: string | null;
                state?: "open" | "all";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IncidentListView"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The role may not view incidents */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid ID or organization */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Incidents cannot be read on this server (incidents-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    get_incident: {
        parameters: {
            query?: {
                organization_id?: string | null;
            };
            header?: never;
            path: {
                incident_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IncidentDetailView"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Signed in, but not a member of any organization */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such incident for the caller */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid ID or organization */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Incidents cannot be read on this server (incidents-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    move_incident: {
        parameters: {
            query?: {
                organization_id?: string | null;
            };
            header?: never;
            path: {
                incident_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TransitionRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IncidentDetailView"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The role may not update incidents */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such incident for the caller */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not allowed from its state (illegal-incident-step), resolution without evidence (evidence-required), or it changed meanwhile (incident-moved) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid ID or organization */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Incidents cannot be read on this server (incidents-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    complete_etsy_connection: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EtsyCallback"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConnectedShopView"];
                };
            };
            /** @description The state is missing, unknown, used, expired or from another session (etsy-state-rejected), Etsy refused the code (etsy-authorization-refused), or the body is not valid JSON */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not the Owner with a second factor (forbidden, mfa-required), not a web session (web-session-required), or not from the web app (csrf-failed) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The Etsy account has no shop (etsy-no-shop), or the shop is connected to another organization (etsy-shop-connected-elsewhere) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Missing or oversized code */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Etsy did not answer usefully; nothing was saved (etsy-unreachable) */
            502: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in, the database or the Etsy connection is unavailable (etsy-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    me: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Me"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Signed in, but not a member of any organization */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in or the database is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    get_notifications: {
        parameters: {
            query?: {
                organization_id?: string | null;
                unread_only?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InboxView"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not a member of the organization */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid ID or organization */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Incidents cannot be read on this server (incidents-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_notifications: {
        parameters: {
            query?: {
                organization_id?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MarkReadRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not a member of the organization */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid ID or organization */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Incidents cannot be read on this server (incidents-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    retry_dead_letter: {
        parameters: {
            query?: {
                organization_id?: string | null;
            };
            header?: never;
            path: {
                job_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RetriedJobView"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Only the Owner and Admins see the queue (forbidden) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such job in the organization */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The job is not dead (job-not-dead), or it runs an execution: retry the execution (retry-through-execution, with `execution_id`) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["RetryThroughExecutionProblem"];
                };
            };
            /** @description Invalid ID */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not available on this server (operations-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_email_failures: {
        parameters: {
            query?: {
                cursor?: string | null;
                limit?: number;
                organization_id?: string | null;
                status?: components["schemas"]["FailedStatus"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FailedEmailList"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Only the Owner and Admins see the queue (forbidden) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid ID, status, limit or cursor */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not available on this server (operations-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    get_operations_health: {
        parameters: {
            query?: {
                organization_id?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperationsHealthView"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Only the Owner and Admins see the queue (forbidden) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid ID */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not available on this server (operations-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    invite_organization_member: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organization_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Invitation"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InvitationView"];
                };
            };
            /** @description The body is not valid JSON */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Signed in, but not a member of any organization */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such member, shop or grant in this organization */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Already a member, or the email already has an account */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid email or role */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invitations cannot be sent right now */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_organization_members: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organization_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberList"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Owner or Admin of this organization, or the session lacks MFA */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such member, shop or grant in this organization */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid path, body or role */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in or the database is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    remove_organization_member: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                membership_id: string;
                organization_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Owner or Admin of this organization, or the session lacks MFA */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such member, shop or grant in this organization */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid path, body or role */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in or the database is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    change_member_role: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                membership_id: string;
                organization_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RoleChange"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberView"];
                };
            };
            /** @description The body is not valid JSON */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Signed in, but not a member of any organization */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such member, shop or grant in this organization */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid role */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in or the database is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    grant_member_shop: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                membership_id: string;
                organization_id: string;
                shop_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Owner or Admin of this organization, or the session lacks MFA */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such member, shop or grant in this organization */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid path, body or role */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in or the database is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    revoke_member_shop: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                membership_id: string;
                organization_id: string;
                shop_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Owner or Admin of this organization, or the session lacks MFA */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such member, shop or grant in this organization */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid path, body or role */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in or the database is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    get_relay_items: {
        parameters: {
            query?: {
                cursor?: string | null;
                organization_id?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RelayItemListView"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The role may not act on fulfillment */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid ID or organization */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The relay is not set up on this server (relay-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    get_relay_code: {
        parameters: {
            query?: {
                organization_id?: string | null;
            };
            header?: never;
            path: {
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RelayCodeView"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Signed in, but not a member of any organization */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No code for the caller (none, closed, expired or not allowed) */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid ID or organization */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The relay is not set up on this server (relay-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    paste_tracking: {
        parameters: {
            query?: {
                organization_id?: string | null;
            };
            header?: never;
            path: {
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TrackingPaste"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RelayPasteView"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not an Owner or Admin (forbidden), or no second factor (mfa-required) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such relay item for the caller */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Pasted already or closed (relay-item-moved), or the number is used for another order (tracking-already-used) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description An unknown carrier or a number in the wrong format (tracking-invalid) */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The relay is not set up on this server (relay-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_shop_integrations: {
        parameters: {
            query?: {
                organization_id?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IntegrationList"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Only the Owner and Admins see connections (forbidden) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The named organization does not exist for the caller */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid organization ID */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in or the database is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    check_shop_capabilities: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                shop_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CapabilityCheckView"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Only the Owner and Admins re-check (forbidden), or the request did not come from the web app (csrf-failed) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such shop connection for the caller */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The shop is not connected (shop-not-connected; `reason` says why) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ShopNotConnectedProblem"];
                };
            };
            /** @description Invalid shop ID */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Checked moments ago (capability-check-too-soon); see Retry-After */
            429: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The Etsy connection is not set up on this server (etsy-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    disconnect_etsy_shop: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                shop_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IntegrationView"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not the Owner, no second factor, no recent step-up (forbidden, mfa-required, step-up-required), or the request did not come from the web app (csrf-failed) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such shop connection for the caller */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid shop ID */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The token vault is not set up on this server (etsy-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    shops: {
        parameters: {
            query?: {
                cursor?: string | null;
                limit?: number;
                organization_id?: string | null;
                shop_id?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShopList"];
                };
            };
            /** @description The caller belongs to several organizations and named none */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Signed in, but not a member of any organization */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The named shop or organization does not exist for the caller */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid filter, limit or cursor */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in or the database is unavailable */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    remove_etsy_shop: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                shop_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not the Owner, no second factor, no recent step-up (forbidden, mfa-required, step-up-required), or the request did not come from the web app (csrf-failed) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such shop for the caller, or it was already removed */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid shop ID */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Removing shops is not set up on this server (etsy-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    get_browser_environment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                shop_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrowserEnvironmentView"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Only the Owner and Admins see the browser environment (forbidden) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such shop for the caller */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Invalid shop ID */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Browser environments are not set up on this server (browser-environments-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_shop_listings: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                shop_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListingsView"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Signed in, but not a member of any organization */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such shop for the caller (or the caller's role may not see it) */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The shop is not connected (shop-not-connected; `reason` says why, `needs_reauth` means reconnect it), or the connection lacks the scope (etsy-scope-missing) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ShopNotConnectedProblem"];
                };
            };
            /** @description Invalid shop ID or query */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Etsy did not answer and nothing recent is cached (etsy-data-unavailable; see Retry-After), or live shop data is not set up (shop-data-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    export_shop_orders: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                shop_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExportOrdersRequest"];
            };
        };
        responses: {
            /** @description The CSV file (UTF-8 with a byte-order mark) */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "text/csv": string;
                };
            };
            /** @description The body is not valid JSON */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Signed in, but not a member of any organization */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such shop for the caller (or the caller's role may not see it) */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The shop is not connected (shop-not-connected; `reason` says why, `needs_reauth` means reconnect it), or the connection lacks the scope (etsy-scope-missing) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ShopNotConnectedProblem"];
                };
            };
            /** @description Invalid shop ID or query */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not set up (orders-bulk-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    resync_shop_orders: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                shop_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResyncOrdersRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResyncOrdersView"];
                };
            };
            /** @description The body is not valid JSON */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The role may not re-sync orders (orders-action-forbidden) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such shop for the caller (or the caller's role may not see it) */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The shop is not connected (shop-not-connected; `reason` says why, `needs_reauth` means reconnect it), or the connection lacks the scope (etsy-scope-missing) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ShopNotConnectedProblem"];
                };
            };
            /** @description Invalid shop ID or query */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Re-synced moments ago (resync-rate-limited; see Retry-After) */
            429: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Re-syncs are not set up (orders-bulk-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    start_order_sync: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                shop_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SyncView"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Only the Owner and Admins start a sync (forbidden), or the request did not come from the web app (csrf-failed) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such shop for the caller */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The shop is not connected (shop-not-connected; `reason` says why) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ShopNotConnectedProblem"];
                };
            };
            /** @description Invalid shop ID */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The stored order history is not set up on this server (shop-data-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_shop_orders: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
                period?: components["schemas"]["OrderPeriod"];
                state?: components["schemas"]["OrderFilter"] | null;
            };
            header?: never;
            path: {
                shop_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrdersView"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Signed in, but not a member of any organization */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such shop for the caller (or the caller's role may not see it) */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The shop is not connected (shop-not-connected; `reason` says why, `needs_reauth` means reconnect it), or the connection lacks the scope (etsy-scope-missing) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ShopNotConnectedProblem"];
                };
            };
            /** @description Invalid shop ID or query */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Etsy did not answer and nothing recent is cached (etsy-data-unavailable; see Retry-After), or live shop data is not set up (shop-data-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    get_shop_order: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                order_id: number;
                shop_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrderDetailView"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Signed in, but not a member of any organization */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such shop for the caller (or the caller's role may not see it) */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The shop is not connected (shop-not-connected; `reason` says why, `needs_reauth` means reconnect it), or the connection lacks the scope (etsy-scope-missing) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ShopNotConnectedProblem"];
                };
            };
            /** @description Invalid shop ID or query */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Etsy did not answer and nothing recent is cached (etsy-data-unavailable; see Retry-After), or live shop data is not set up (shop-data-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    get_shop_overview: {
        parameters: {
            query?: {
                utc_offset_minutes?: number;
            };
            header?: never;
            path: {
                shop_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShopOverviewView"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Signed in, but not a member of any organization */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such shop for the caller (or the caller's role may not see it) */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The shop is not connected (shop-not-connected; `reason` says why, `needs_reauth` means reconnect it), or the connection lacks the scope (etsy-scope-missing) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ShopNotConnectedProblem"];
                };
            };
            /** @description Invalid shop ID or query */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Etsy did not answer and nothing recent is cached (etsy-data-unavailable; see Retry-After), or live shop data is not set up (shop-data-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_shop_reviews: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                shop_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReviewsView"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Signed in, but not a member of any organization */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such shop for the caller (or the caller's role may not see it) */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The shop is not connected (shop-not-connected; `reason` says why, `needs_reauth` means reconnect it), or the connection lacks the scope (etsy-scope-missing) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ShopNotConnectedProblem"];
                };
            };
            /** @description Invalid shop ID or query */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Etsy did not answer and nothing recent is cached (etsy-data-unavailable; see Retry-After), or live shop data is not set up (shop-data-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    get_shop_shipping: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                shop_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShippingView"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Signed in, but not a member of any organization */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such shop for the caller (or the caller's role may not see it) */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The shop is not connected (shop-not-connected; `reason` says why, `needs_reauth` means reconnect it), or the connection lacks the scope (etsy-scope-missing) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ShopNotConnectedProblem"];
                };
            };
            /** @description Invalid shop ID or query */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Etsy did not answer and nothing recent is cached (etsy-data-unavailable; see Retry-After), or live shop data is not set up (shop-data-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    get_shop_stats: {
        parameters: {
            query?: {
                utc_offset_minutes?: number;
            };
            header?: never;
            path: {
                shop_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShopStatsView"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Signed in, but not a member of any organization */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description No such shop for the caller (or the caller's role may not see it) */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description The shop is not connected (shop-not-connected; `reason` says why, `needs_reauth` means reconnect it), or the connection lacks the scope (etsy-scope-missing) */
            409: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ShopNotConnectedProblem"];
                };
            };
            /** @description Invalid shop ID or query */
            422: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ValidationProblem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Etsy did not answer and nothing recent is cached (etsy-data-unavailable; see Retry-After), or live shop data is not set up (shop-data-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    connect_etsy_shop: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthorizationView"];
                };
            };
            /** @description Not signed in, or the access token was rejected */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not the Owner, no second factor, no recent step-up (forbidden, mfa-required, step-up-required, web-session-required), or the request did not come from the web app (csrf-failed) */
            403: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Sign-in, the database or the Etsy connection is unavailable (etsy-unavailable) */
            503: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    receive_etsy_webhook: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Signed, but not an Etsy event (webhook-invalid) */
            400: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Signature, timestamp or headers invalid (webhook-signature-invalid) */
            401: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Webhooks are not enabled on this server (not-found) */
            404: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Body over 64 KiB (webhook-too-large) */
            413: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Over the per-source rate limit (webhook-rate-limited) */
            429: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unexpected error. Quote the request ID when reporting it */
            500: {
                headers: {
                    /** @description ID of this request, generated by the server. Quote it when reporting a problem. */
                    "X-Request-Id": string;
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
}
