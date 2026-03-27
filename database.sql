-- Clean start if re-running in a test database
drop table if exists experiment_settings cascade;
drop table if exists incorrect_inputs cascade;
drop table if exists move_logs cascade;
drop table if exists puzzle_attempts cascade;
drop table if exists experiment_sessions cascade;
drop table if exists participants cascade;
drop table if exists staff cascade;
drop type if exists advice_state_enum cascade;

-- Advice state enum
create type advice_state_enum as enum (
    'correct',
    'slightly_incorrect',
    'blatantly_incorrect'
);

-- Experiment setting variables
create table experiment_settings (
    id bigint generated always as identity primary key,
    scaling_factor numeric(2,1) not null check (scaling_factor >= 0 and scaling_factor <= 1),
    blatancy_factor numeric(2,1) not null check (blatancy_factor >= 0 and blatancy_factor <= 1),
    updated_at timestamptz not null default now()
);

-- 1. staff
create table staff (
    id bigint generated always as identity primary key,
    username text not null unique,
    password_hash text not null,
    created_at timestamptz not null default now()
);

-- 2. participants
create table participants (
    id bigint generated always as identity primary key,
    username text not null unique,
    created_at timestamptz not null default now()
);

-- 3. experiment_sessions
create table experiment_sessions (
    id bigint generated always as identity primary key,
    participant_id bigint not null references participants(id) on delete cascade,
    scaling_factor numeric(3,2) not null check (scaling_factor >= 0 and scaling_factor <= 1),
    blatancy_factor numeric(3,2) not null check (blatancy_factor >= 0 and blatancy_factor <= 1),
    started_at timestamptz,
    finished_at timestamptz,
    check (finished_at is null or started_at is null or finished_at >= started_at)
);

-- 4. puzzle_attempts
create table puzzle_attempts (
    id bigint generated always as identity primary key,
    session_id bigint not null references experiment_sessions(id) on delete cascade,
    puzzle_id text not null,
    puzzle_order integer not null check (puzzle_order > 0),
    score integer not null default 0,
    total_time_seconds numeric(10,3) not null default 0 check (total_time_seconds >= 0),
    completed boolean not null default false,
    started_at timestamptz,
    finished_at timestamptz,
    check (finished_at is null or started_at is null or finished_at >= started_at),
    unique (session_id, puzzle_order)
);

-- 5. move_logs
create table move_logs (
    puzzle_attempt_id bigint not null references puzzle_attempts(id) on delete cascade,
    move_number integer not null check (move_number > 0),
    cell_index integer not null check (
        cell_index between 11 and 99
        and floor(cell_index / 10.0) between 1 and 9
        and mod(cell_index, 10) between 1 and 9
    ),
    advice_state advice_state_enum not null,
    tips jsonb,
    incorrect_inputs_count integer not null default 0 check (incorrect_inputs_count >= 0),
    time_taken_seconds numeric(10,3) not null default 0 check (time_taken_seconds >= 0),
    final_input integer check (final_input between 1 and 9),
    created_at timestamptz not null default now(),
    check (tips is null or jsonb_typeof(tips) = 'array'),
    check (tips is null or jsonb_array_length(tips) <= 10),
    primary key (puzzle_attempt_id, move_number)
);

-- 6. incorrect_inputs
create table incorrect_inputs (
    puzzle_attempt_id bigint not null references puzzle_attempts(id) on delete cascade,
    move_number integer not null check (move_number > 0),
    attempt_number integer not null check (attempt_number > 0),
    cell_index integer not null check (
        cell_index between 11 and 99
        and floor(cell_index / 10.0) between 1 and 9
        and mod(cell_index, 10) between 1 and 9
    ),
    input_value integer not null check (input_value between 1 and 9),
    correct_value integer not null check (correct_value between 1 and 9),
    matched_tip boolean not null default false,
    matched_matching_numbers boolean not null default false,
    matched_row_col_grid text[] default '{}'::text[] check (matched_row_col_grid <@ array['row','column','grid']),
    created_at timestamptz not null default now(),
    check (input_value <> correct_value),
    primary key (puzzle_attempt_id, move_number, attempt_number)
);

-- Helpful indexes
create index idx_experiment_sessions_participant_id
    on experiment_sessions(participant_id);

create index idx_puzzle_attempts_session_id
    on puzzle_attempts(session_id);

create index idx_move_logs_puzzle_attempt_id
    on move_logs(puzzle_attempt_id);

create index idx_move_logs_advice_state
    on move_logs(advice_state);

create index idx_move_logs_cell_index
    on move_logs(cell_index);

create index idx_incorrect_inputs_puzzle_attempt_id
    on incorrect_inputs(puzzle_attempt_id);

create index idx_incorrect_inputs_puzzle_attempt_move
    on incorrect_inputs(puzzle_attempt_id, move_number);

create index idx_incorrect_inputs_move_number
    on incorrect_inputs(move_number);

create index idx_incorrect_inputs_cell_index
    on incorrect_inputs(cell_index);

create index idx_incorrect_inputs_matched_tip
    on incorrect_inputs(matched_tip);

-- Enable row level security on all tables

alter table experiment_settings enable row level security;
alter table staff enable row level security;
alter table participants enable row level security;
alter table experiment_sessions enable row level security;
alter table puzzle_attempts enable row level security;
alter table move_logs enable row level security;
alter table incorrect_inputs enable row level security;

-- SELECT policies for all tables allow read access to anon role, 
-- and INSERT/UPDATE policies allow writing with no restrictions for simplicity in this coursework context. 
-- In a real application, these would be more restrictive.

-- participants
create policy "participants_select"
on participants
for select
to anon
using (true);

create policy "participants_insert"
on participants
for insert
to anon
with check (true);

-- experiment_settings
create policy "experiment_settings_select"
on experiment_settings
for select
to anon
using (true);

create policy "experiment_settings_update"
on experiment_settings
for update
to anon
using (true)
with check (true);

-- experiment_sessions
create policy "experiment_sessions_select"
on experiment_sessions
for select
to anon
using (true);

create policy "experiment_sessions_insert"
on experiment_sessions
for insert
to anon
with check (true);

create policy "experiment_sessions_update"
on experiment_sessions
for update
to anon
using (true)
with check (true);

-- puzzle_attempts
create policy "puzzle_attempts_select"
on puzzle_attempts
for select
to anon
using (true);

create policy "puzzle_attempts_insert"
on puzzle_attempts
for insert
to anon
with check (true);

create policy "puzzle_attempts_update"
on puzzle_attempts
for update
to anon
using (true)
with check (true);

-- move_logs
create policy "move_logs_select"
on move_logs
for select
to anon
using (true);

create policy "move_logs_insert"
on move_logs
for insert
to anon
with check (true);

-- incorrect_inputs
create policy "incorrect_inputs_select"
on incorrect_inputs
for select
to anon
using (true);

create policy "incorrect_inputs_insert"
on incorrect_inputs
for insert
to anon
with check (true);

-- staff
-- This allows client-side staff login by exposing password hashes, only kept for coursework simplicity
create policy "staff_select"
on staff
for select
to anon
using (true);

-- Insert initial test data
-- Staff user created manually with password "admin123"
insert into staff (username, password_hash) values (
    'staff',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
);

insert into experiment_settings (scaling_factor, blatancy_factor) values (1.0, 0.5);