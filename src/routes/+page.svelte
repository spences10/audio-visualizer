<script lang="ts">
	import AudioVisualizer from '$lib/components/audio-visualizer.svelte';
	import Mic from '$lib/icons/mic.svelte';
	import Stop from '$lib/icons/stop.svelte';
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
		<div class="flex items-center justify-center gap-4">
			<button
				class="btn btn-circle btn-lg {recording.is_recording
					? 'btn-error'
					: 'btn-primary'}"
				onclick={toggle_recording}
				aria-label={recording.is_recording
					? 'Stop recording'
					: 'Start recording'}
			>
				{#if recording.is_recording}
					<Stop height="24px" width="24px" />
				{:else}
					<Mic height="24px" width="24px" />
				{/if}
			</button>

			<label class="label flex cursor-pointer items-center gap-2">
				<span class="label-text text-sm">Mirror</span>
				<input
					type="checkbox"
					class="toggle bg-base-300 toggle-lg toggle-primary checked:bg-none"
					bind:checked={recording.mirror_mode}
				/>
			</label>
		</div>

		<div class="rounded-lg bg-base-200 p-4">
			<AudioVisualizer
				is_recording={recording.is_recording}
				get_audio_data={() => recording.get_audio_data()}
				mirror_mode={recording.mirror_mode}
			/>
		</div>
	</div>
</div>
