<script lang="ts">
	let { is_recording, get_audio_data } = $props<{
		is_recording: boolean;
		get_audio_data: () => Uint8Array | null;
	}>();

	let canvas_ref = $state<HTMLCanvasElement | null>(null);
	let color_ref = $state<HTMLDivElement | null>(null);
	let request_ref = $state<number | null>(null);

	function render_frame() {
		if (!canvas_ref || !color_ref) return;

		const canvas = canvas_ref;
		const ctx = canvas.getContext('2d');

		if (!ctx) return;

		// Clear canvas - use the actual display size, not the scaled canvas size
		const rect = canvas.getBoundingClientRect();
		ctx.clearRect(0, 0, rect.width, rect.height);

		// Get the computed color from the helper div
		const computed_style = window.getComputedStyle(color_ref);
		let primary_color = computed_style
			.getPropertyValue('--color-primary')
			.trim();

		// Fallback to a default color if primary color is not available
		if (!primary_color) {
			primary_color = '#3b82f6'; // blue-500 as fallback
		}

		if (is_recording) {
			const audio_data = get_audio_data();

			if (!audio_data) return;

			const rect = canvas.getBoundingClientRect();
			const bar_width = Math.ceil(rect.width / 64);
			const bar_gap = 2;
			const bar_count = Math.floor(
				rect.width / (bar_width + bar_gap),
			);
			const multiplier = rect.height / 255;

			// Use the computed style directly
			ctx.fillStyle = primary_color;

			// Draw bars
			for (let i = 0; i < bar_count; i++) {
				// Get audio data with some randomness for aesthetics when not enough real data
				const index = Math.min(i, audio_data.length - 1);
				let value = audio_data[index] || 0;

				// Add subtle randomness for visual interest
				if (value < 10) {
					value = Math.random() * 10 + 2;
				}

				const x = i * (bar_width + bar_gap);
				const height = value * multiplier;
				const y = rect.height - height;

				// Draw rounded bars
				ctx.beginPath();
				ctx.roundRect(x, y, bar_width, height, [
					bar_width / 2,
					bar_width / 2,
					0,
					0,
				]);
				ctx.fill();
			}
		} else {
			// Draw placeholder line when not recording
			const rect = canvas.getBoundingClientRect();
			const line_y = rect.height / 2;

			// Use a semi-transparent version of the base content
			ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)';
			ctx.lineWidth = 1;

			ctx.beginPath();
			ctx.moveTo(0, line_y);
			ctx.lineTo(rect.width, line_y);
			ctx.stroke();
		}

		request_ref = requestAnimationFrame(render_frame);
	}

	$effect(() => {
		if (canvas_ref) {
			// Set canvas size
			const rect = canvas_ref.getBoundingClientRect();
			canvas_ref.width = rect.width * window.devicePixelRatio;
			canvas_ref.height = rect.height * window.devicePixelRatio;

			// Scale the context to account for device pixel ratio
			const ctx = canvas_ref.getContext('2d');
			if (ctx) {
				ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
			}

			// Start animation loop
			request_ref = requestAnimationFrame(render_frame);
		}

		return () => {
			if (request_ref) {
				cancelAnimationFrame(request_ref);
				request_ref = null;
			}
		};
	});
</script>

<!-- This hidden element will pick up the theme's primary color -->
<div bind:this={color_ref} class="hidden bg-primary"></div>

<canvas
	bind:this={canvas_ref}
	class="h-24 w-full rounded-md transition-all duration-300 {is_recording
		? 'opacity-100'
		: 'opacity-50'}"
></canvas>
