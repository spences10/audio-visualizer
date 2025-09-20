import { recording } from '$lib/state/audio-state.svelte';

// Audio visualization components
let audio_context: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let audio_source: MediaStreamAudioSourceNode | null = null;
let audio_stream: MediaStream | null = null;
let visualization_data: Uint8Array<ArrayBuffer> | null = null;
let visualization_frame_id: number | null = null;

function update_visualization() {
	if (!analyser || !visualization_data) return;

	// Get frequency data
	analyser.getByteFrequencyData(visualization_data);

	// Update the state for the visualizer
	recording.set_audio_data(visualization_data);

	// Continue the update loop
	visualization_frame_id = requestAnimationFrame(
		update_visualization,
	);
}

export async function start_audio_visualization() {
	try {
		// Request microphone access
		audio_stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				channelCount: 1, // Mono audio
				sampleRate: 16000, // Common sample rate for speech recognition
			},
		});

		// Set up audio analysis for visualization
		audio_context = new (window.AudioContext ||
			(window as any).webkitAudioContext)();
		analyser = audio_context.createAnalyser();
		analyser.fftSize = 256;
		audio_source =
			audio_context.createMediaStreamSource(audio_stream);
		audio_source.connect(analyser);

		// Create data array for visualization
		visualization_data = new Uint8Array(
			analyser.frequencyBinCount,
		) as Uint8Array<ArrayBuffer>;

		// Start visualization updates
		update_visualization();
	} catch (error) {
		console.error('Error starting audio visualization:', error);
	}
}

export function stop_audio_visualization() {
	// Clean up audio visualization resources
	if (visualization_frame_id) {
		cancelAnimationFrame(visualization_frame_id);
		visualization_frame_id = null;
	}

	// Stop all tracks in the media stream to turn off the microphone
	if (audio_stream) {
		audio_stream.getTracks().forEach((track) => track.stop());
		audio_stream = null;
	}

	if (audio_source) {
		audio_source.disconnect();
		audio_source = null;
	}

	if (audio_context) {
		if (audio_context.state !== 'closed') {
			audio_context.close().catch(console.error);
		}
		audio_context = null;
	}

	// Clear visualization data
	visualization_data = null;
	analyser = null;
}
