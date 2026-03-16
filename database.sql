-- Optional: clean start if re-running in a test database
drop table if exists incorrect_inputs cascade;
drop table if exists move_logs cascade;
drop table if exists puzzle_attempts cascade;
drop table if exists experiment_sessions cascade;
drop table if exists participants cascade;
drop table if exists staff cascade;
drop type if exists advice_state_enum cascade;

-- Staff password has
-- 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
-- for "admin123"

-- Advice state enum
create type advice_state_enum as enum (
    'correct',
    'slightly_incorrect',
    'blatantly_incorrect'
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
    experiment_date date not null,
    scaling_factor numeric(3,2) not null check (scaling_factor >= 0 and scaling_factor <= 1),
    blatancy_factor numeric(3,2) not null check (blatancy_factor >= 0 and blatancy_factor <= 1),
    started_at timestamptz,
    finished_at timestamptz,
    created_at timestamptz not null default now(),
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
    created_at timestamptz not null default now(),
    check (finished_at is null or started_at is null or finished_at >= started_at),
    unique (session_id, puzzle_order)
);

-- 5. move_logs
create table move_logs (
    id bigint generated always as identity primary key,
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
    unique (puzzle_attempt_id, move_number)
);

-- 6. incorrect_inputs
create table incorrect_inputs (
    id bigint generated always as identity primary key,
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
    matched_row_col_highlighting boolean not null default false,
    created_at timestamptz not null default now(),
    check (input_value <> correct_value),
    unique (puzzle_attempt_id, move_number, attempt_number)
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

-- Insert initial staff user
insert into staff (username, password_hash) values (
    'staff',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
);
