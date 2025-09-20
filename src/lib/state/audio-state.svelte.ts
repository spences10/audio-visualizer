let is_recording = $state(false);
let transcript = $state('');
let enable_grammar_correction = $state(true); // Default enabled
let audio_data = $state<Uint8Array | null>(null);

export const recording = {
	get is_recording() {
		return is_recording;
	},
	set is_recording(value: boolean) {
		is_recording = value;
	},

	get transcript() {
		return transcript;
	},
	set transcript(value: string) {
		transcript = value;
	},

	get enable_grammar_correction() {
		return enable_grammar_correction;
	},
	set enable_grammar_correction(value: boolean) {
		enable_grammar_correction = value;
	},

	get_audio_data() {
		return audio_data;
	},

	set_audio_data(value: Uint8Array | null) {
		audio_data = value;
	},
};
