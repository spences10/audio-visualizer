<script lang="ts">
	import AudioVisualizer from '$lib/components/audio-visualizer.svelte';
	import Mic from '$lib/icons/mic.svelte';
	import {
		start_audio_visualization,
		stop_audio_visualization,
	} from '$lib/services/audio-service';
	import { recording } from '$lib/state/audio-state.svelte';

	function toggle_recording() {
		if (recording.is_recording) {
			stop_audio_visualization();
			recording.is_recording = false;
		} else {
			start_audio_visualization();
			recording.is_recording = true;
		}
	}
</script>

<div class="container mx-auto max-w-2xl p-8">
	<h1 class="mb-8 text-3xl font-bold">Audio Visualizer</h1>

	<div class="space-y-6">
		<button
			onclick={toggle_recording}
			class="btn flex items-center gap-2 btn-primary"
		>
			<Mic class_names="w-5 h-5" />
			{recording.is_recording ? 'Stop' : 'Start'} Recording
		</button>

		<div class="rounded-lg bg-base-200 p-4">
			<AudioVisualizer
				is_recording={recording.is_recording}
				get_audio_data={() => recording.get_audio_data()}
			/>
		</div>
	</div>
</div>
