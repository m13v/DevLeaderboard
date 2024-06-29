
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;

create table "public"."completed_requests" (
    "id" integer not null default nextval('completed_requests_id_seq'::regclass),
    "repo" text not null,
    "user" text not null,
    "commit_sha" text not null,
    "created_at" timestamp with time zone not null default now(),
    "completed_at" timestamp with time zone not null default now()
);


create table "public"."queue" (
    "id" integer not null default nextval('queue_id_seq'::regclass),
    "repo" text not null,
    "user" text not null,
    "commit_sha" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter sequence "public"."completed_requests_id_seq" owned by "public"."completed_requests"."id";

alter sequence "public"."queue_id_seq" owned by "public"."queue"."id";

CREATE UNIQUE INDEX completed_requests_pkey ON public.completed_requests USING btree (id);

CREATE UNIQUE INDEX queue_pkey ON public.queue USING btree (id);

alter table "public"."completed_requests" add constraint "completed_requests_pkey" PRIMARY KEY using index "completed_requests_pkey";

alter table "public"."queue" add constraint "queue_pkey" PRIMARY KEY using index "queue_pkey";

grant delete on table "public"."completed_requests" to "anon";

grant insert on table "public"."completed_requests" to "anon";

grant references on table "public"."completed_requests" to "anon";

grant select on table "public"."completed_requests" to "anon";

grant trigger on table "public"."completed_requests" to "anon";

grant truncate on table "public"."completed_requests" to "anon";

grant update on table "public"."completed_requests" to "anon";

grant delete on table "public"."completed_requests" to "authenticated";

grant insert on table "public"."completed_requests" to "authenticated";

grant references on table "public"."completed_requests" to "authenticated";

grant select on table "public"."completed_requests" to "authenticated";

grant trigger on table "public"."completed_requests" to "authenticated";

grant truncate on table "public"."completed_requests" to "authenticated";

grant update on table "public"."completed_requests" to "authenticated";

grant delete on table "public"."completed_requests" to "service_role";

grant insert on table "public"."completed_requests" to "service_role";

grant references on table "public"."completed_requests" to "service_role";

grant select on table "public"."completed_requests" to "service_role";

grant trigger on table "public"."completed_requests" to "service_role";

grant truncate on table "public"."completed_requests" to "service_role";

grant update on table "public"."completed_requests" to "service_role";

grant delete on table "public"."queue" to "anon";

grant insert on table "public"."queue" to "anon";

grant references on table "public"."queue" to "anon";

grant select on table "public"."queue" to "anon";

grant trigger on table "public"."queue" to "anon";

grant truncate on table "public"."queue" to "anon";

grant update on table "public"."queue" to "anon";

grant delete on table "public"."queue" to "authenticated";

grant insert on table "public"."queue" to "authenticated";

grant references on table "public"."queue" to "authenticated";

grant select on table "public"."queue" to "authenticated";

grant trigger on table "public"."queue" to "authenticated";

grant truncate on table "public"."queue" to "authenticated";

grant update on table "public"."queue" to "authenticated";

grant delete on table "public"."queue" to "service_role";

grant insert on table "public"."queue" to "service_role";

grant references on table "public"."queue" to "service_role";

grant select on table "public"."queue" to "service_role";

grant trigger on table "public"."queue" to "service_role";

grant truncate on table "public"."queue" to "service_role";

grant update on table "public"."queue" to "service_role";