async function getOrCreateParticipant(username) {
        const { data: existingParticipant, error: selectError } = await window.supabaseClient
            .from("participants")
            .select("id, username")
            .eq("username", username)
            .maybeSingle();

        if (selectError) {
            throw selectError;
        }

        if (existingParticipant) {
            return existingParticipant;
        }

        const { data: newParticipant, error: insertError } = await window.supabaseClient
            .from("participants")
            .insert([{ username: username }])
            .select("id, username")
            .single();

        if (insertError) {
            throw insertError;
        }

        return newParticipant;
    }

async function setExperimentSettings(scalingFactor, blatancyFactor) {
        const { data, error } = await window.supabaseClient
            .from("experiment_settings")
            .update({
                scaling_factor: scalingFactor,
                blatancy_factor: blatancyFactor,
                updated_at: new Date().toISOString()
            })
            .eq("id", 1)
            .select("id, scaling_factor, blatancy_factor, updated_at")
            .single();

        if (error) {
            console.error("Error updating experiment settings:", error);
            throw error;
        }
    }

async function getScalingFactor() {
        const { data, error } = await window.supabaseClient
            .from("experiment_settings")
            .select("scaling_factor")
            .single();

        if (error) {
            console.error("Error fetching scaling factor:", error);
            throw error;
        }

        return data.scaling_factor;
    }

async function getBlatancyFactor() {
        const { data, error } = await window.supabaseClient
            .from("experiment_settings")
            .select("blatancy_factor")
            .single();

        if (error) {
            console.error("Error fetching blatancy factor:", error);
            throw error;
        }

        return data.blatancy_factor;
    }


async function createExperimentSession(participantId) {
        const { data, error } = await window.supabaseClient
            .from("experiment_sessions")
            .insert([{
                participant_id: participantId,
                scaling_factor: await getScalingFactor(),
                blatancy_factor: await getBlatancyFactor(),
                started_at: new Date().toISOString()
            }])
            .select("id, participant_id, started_at")
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

async function endExperimentSession() {
    const experimentSessionId = localStorage.getItem("experimentSessionId");

    if (!experimentSessionId) {
        throw new Error("No session found.");
    }

    const { error } = await window.supabaseClient
        .from("experiment_sessions")
        .update({
            finished_at: new Date().toISOString()
        })
        .eq("id", experimentSessionId)
        .is("finished_at", null);

    if (error) {
        throw error;
    }
}

async function createPuzzleAttempt(sessionId, puzzleId, puzzleOrder) {
    const { data, error } = await window.supabaseClient
        .from("puzzle_attempts")
        .insert([{
            session_id: sessionId,
            puzzle_id: puzzleId,
            puzzle_order: puzzleOrder,
            started_at: new Date().toISOString()
        }])
        .select("id, session_id, puzzle_order, started_at")
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function updatePuzzleAttemptProgress({
    puzzleAttemptId,
    score,
    totalTimeSeconds
}) {
    const { data, error } = await window.supabaseClient
        .from("puzzle_attempts")
        .update({
            score: score,
            total_time_seconds: totalTimeSeconds
        })
        .eq("id", puzzleAttemptId)
        .select("id, score, total_time_seconds")
        .single();

    if (error) {
        console.error("Error updating puzzle attempt progress:", error);
        throw error;
    }

    return data;
}

async function completePuzzleAttempt({
    puzzleAttemptId, 
    score, 
    totalTimeSeconds
}) {
    const { data, error } = await window.supabaseClient
        .from("puzzle_attempts")
        .update({
            score: score,
            total_time_seconds: totalTimeSeconds,
            completed: true,
            finished_at: new Date().toISOString()
        })
        .eq("id", puzzleAttemptId)
        .select("id, score, total_time_seconds, completed, finished_at")
        .single();

    if (error) {
        console.error("Error completing puzzle attempt:", error);
        throw error;
    }

    return data;
}

async function logMove({
    puzzleAttemptId,
    moveNumber,
    cellIndex,
    adviceState,
    tips,
    incorrectInputsCount,
    timeTakenSeconds,
    finalInput
}) {
    const adviceMap = {
        "correct": "correct",
        "slightly-incorrect": "slightly_incorrect",
        "blatantly-incorrect": "blatantly_incorrect"
    };

    const { data, error } = await window.supabaseClient
        .from("move_logs")
        .insert([{
            puzzle_attempt_id: puzzleAttemptId,
            move_number: moveNumber,
            cell_index: cellIndex,
            advice_state: adviceMap[adviceState] || "correct",
            tips: tips ?? null,
            incorrect_inputs_count: incorrectInputsCount ?? 0,
            time_taken_seconds: timeTakenSeconds ?? 0,
            final_input: finalInput ? parseInt(finalInput, 10) : null,
            created_at: new Date().toISOString()
        }])
        .select("move_number, cell_index")
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function logIncorrectInput({
    puzzleAttemptId,
    moveNumber,
    attemptNumber,
    cellIndex,
    inputValue,
    correctValue,
    matchedTip,
    matchedMatchingNumbers,
    matchedRowColGrid
}) {
    const { data, error } = await window.supabaseClient
        .from("incorrect_inputs")
        .insert([{
            puzzle_attempt_id: puzzleAttemptId,
            move_number: moveNumber,
            attempt_number: attemptNumber,
            cell_index: cellIndex,
            input_value: inputValue,
            correct_value: correctValue,
            matched_tip: matchedTip ?? false,
            matched_matching_numbers: matchedMatchingNumbers ?? false,
            matched_row_col_grid: matchedRowColGrid ?? [],
            created_at: new Date().toISOString()
        }])
        .select("move_number, attempt_number, cell_index")
        .single();

    if (error) {
        console.error("Error logging incorrect input:", error);
        throw error;
    }

    return data;
}