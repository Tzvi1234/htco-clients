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
         * @description The session's assurance and the user's authenticator apps.
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
    "/v1/shop-integrations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Marketplace connections of the organization's shops
         * @description Status, granted scopes and token health per shop, for the shop card; never a token.
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
    "/v1/shops/{shop_id}/orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The shop's orders of the last 30 days, live from the marketplace
         * @description Newest first. Buyer display names and tracking numbers only for Owner, Admin,
         *     Operations and Support; never cached by the browser.
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
    "/v1/shops/{shop_id}/overview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The shop's profile and sales, live from the marketplace
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
        /** AssuranceView */
        AssuranceView: {
            /** Assurance */
            assurance: string;
        };
        /** AuthorizationView */
        AuthorizationView: {
            /** Authorization Url */
            authorization_url: string;
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
         * @description Where a result comes from. Phase 5 adds the ingested store for orders.
         * @enum {string}
         */
        DataSource: "etsy_live";
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
        /** FactorView */
        FactorView: {
            /** Id */
            id: string;
            /** Name */
            name: string | null;
            /** Verified */
            verified: boolean;
        };
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
        /** IntegrationList */
        IntegrationList: {
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
            source: components["schemas"]["DataSource"];
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
        };
        /** MoneyView */
        MoneyView: {
            /** Amount */
            amount: string;
            /** Currency */
            currency: string;
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
         * OrderState
         * @enum {string}
         */
        OrderState: "unpaid" | "paid" | "shipped" | "canceled" | "refunded";
        /** OrdersView */
        OrdersView: {
            /** Buyer Details */
            buyer_details: boolean;
            counts: components["schemas"]["OrderCountsView"];
            /**
             * Fetched At
             * Format: date-time
             */
            fetched_at: string;
            /** Items */
            items: components["schemas"]["OrderView"][];
            /** Partial */
            partial: boolean;
            /**
             * Shop Id
             * Format: uuid
             */
            shop_id: string;
            source: components["schemas"]["DataSource"];
            /** Stale */
            stale: boolean;
            /** Total */
            total: number;
            /**
             * Window Start
             * Format: date-time
             */
            window_start: string;
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
            /** Ship By */
            ship_by: string | null;
            /** Shipments */
            shipments: components["schemas"]["ShipmentView"][];
            shipping: components["schemas"]["MoneyView"];
            state: components["schemas"]["OrderState"];
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
            source: components["schemas"]["DataSource"];
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
            source: components["schemas"]["DataSource"];
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
        /** ShopOverviewView */
        ShopOverviewView: {
            /**
             * Fetched At
             * Format: date-time
             */
            fetched_at: string;
            profile: components["schemas"]["ShopProfileView"];
            sales: components["schemas"]["SalesView"] | null;
            /**
             * Shop Id
             * Format: uuid
             */
            shop_id: string;
            source: components["schemas"]["DataSource"];
            /** Stale */
            stale: boolean;
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
            /** @description The shop is not connected (shop-not-connected) */
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
            /** @description The shop is not connected (shop-not-connected), or the connection lacks the scope (etsy-scope-missing) */
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
    list_shop_orders: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
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
            /** @description The shop is not connected (shop-not-connected), or the connection lacks the scope (etsy-scope-missing) */
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
            /** @description The shop is not connected (shop-not-connected), or the connection lacks the scope (etsy-scope-missing) */
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
            /** @description The shop is not connected (shop-not-connected), or the connection lacks the scope (etsy-scope-missing) */
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
            /** @description The shop is not connected (shop-not-connected), or the connection lacks the scope (etsy-scope-missing) */
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
}
