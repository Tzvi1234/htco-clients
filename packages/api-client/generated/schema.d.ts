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
        /**
         * CheckStatus
         * @enum {string}
         */
        CheckStatus: "ok" | "failed";
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
        /** HealthStatus */
        HealthStatus: {
            /**
             * Status
             * @constant
             */
            status: "ok";
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
        /** ShopList */
        ShopList: {
            /** Items */
            items: components["schemas"]["ShopView"][];
            /** Next Cursor */
            next_cursor: string | null;
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
        /** StepUpRequest */
        StepUpRequest: {
            /** Code */
            code: string;
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
            /** @description Missing tokens or a password of the wrong length (validation-error), or a password the sign-in service calls weak (weak-password) */
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
}
