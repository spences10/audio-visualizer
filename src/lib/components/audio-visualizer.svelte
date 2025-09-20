<script lang="ts">
	let {
		is_recording,
		get_audio_data,
		mirror_mode = false,
	} = $props<{
		is_recording: boolean;
		get_audio_data: () => Uint8Array | null;
		mirror_mode?: boolean;
	}>();

	let canvas_ref = $state<HTMLCanvasElement | null>(null);
	let color_ref = $state<HTMLDivElement | null>(null);
	let request_ref = $state<number | null>(null);

	function render_frame() {
		if (!canvas_ref || !color_ref) return;

		const canvas = canvas_ref;
		const ctx = canvas.getContext('2d');

		if (!ctx) return;

		// Get canvas dimensions (use the actual canvas size, not getBoundingClientRect)
		const canvas_width = canvas.width / window.devicePixelRatio;
		const canvas_height = canvas.height / window.devicePixelRatio;

		// Clear canvas
		ctx.clearRect(0, 0, canvas_width, canvas_height);

		// Get the primary color from CSS or use fallback
		let primary_color = '#3b82f6'; // Default fallback

		try {
			const computed_style = window.getComputedStyle(color_ref);
			const css_color =
				computed_style.backgroundColor ||
				computed_style.getPropertyValue('--color-primary').trim();
			if (
				css_color &&
				css_color !== 'rgba(0, 0, 0, 0)' &&
				css_color !== 'transparent'
			) {
				primary_color = css_color;
			}
		} catch (e) {
			// Use fallback color
		}

		if (is_recording) {
			const audio_data = get_audio_data();

			if (!audio_data || audio_data.length === 0) {
				// Draw a minimal animation when no data is available yet
				ctx.fillStyle = primary_color;
				const bar_width = 4;
				const bar_gap = 2;
				const bar_count = Math.floor(
					canvas_width / (bar_width + bar_gap),
				);

				for (let i = 0; i < bar_count; i++) {
					const x = i * (bar_width + bar_gap);
					const height = Math.random() * 20 + 5;

					if (mirror_mode) {
						// Draw from center up and down
						const center_y = canvas_height / 2;
						const y_up = center_y - height;

						// Main bar (up)
						ctx.beginPath();
						ctx.roundRect(x, y_up, bar_width, height, [
							bar_width / 2,
							bar_width / 2,
							0,
							0,
						]);
						ctx.fill();

						// Mirror bar (down) with reduced opacity
						ctx.save();
						ctx.globalAlpha = 0.6;
						ctx.beginPath();
						ctx.roundRect(x, center_y, bar_width, height, [
							0,
							0,
							bar_width / 2,
							bar_width / 2,
						]);
						ctx.fill();
						ctx.restore();
					} else {
						// Normal mode: bars from bottom
						const y = canvas_height - height;
						ctx.beginPath();
						ctx.roundRect(x, y, bar_width, height, [
							bar_width / 2,
							bar_width / 2,
							0,
							0,
						]);
						ctx.fill();
					}
				}
				request_ref = requestAnimationFrame(render_frame);
				return;
			}

			const bar_width = Math.ceil(canvas_width / 64);
			const bar_gap = 2;
			const bar_count = Math.floor(
				canvas_width / (bar_width + bar_gap),
			);
			const base_multiplier = mirror_mode
				? canvas_height / 2 / 255
				: canvas_height / 255;

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
				const height = value * base_multiplier;

				if (mirror_mode) {
					// Draw main bar from center up
					const center_y = canvas_height / 2;
					const y_up = center_y - height;

					ctx.beginPath();
					ctx.roundRect(x, y_up, bar_width, height, [
						bar_width / 2,
						bar_width / 2,
						0,
						0,
					]);
					ctx.fill();

					// Draw mirrored bar from center down with reduced opacity
					ctx.save();
					ctx.globalAlpha = 0.6;
					ctx.beginPath();
					ctx.roundRect(x, center_y, bar_width, height, [
						0,
						0,
						bar_width / 2,
						bar_width / 2,
					]);
					ctx.fill();
					ctx.restore();
				} else {
					// Normal mode: bars from bottom
					const y = canvas_height - height;
					ctx.beginPath();
					ctx.roundRect(x, y, bar_width, height, [
						bar_width / 2,
						bar_width / 2,
						0,
						0,
					]);
					ctx.fill();
				}
			}
		} else {
			// Draw placeholder line when not recording
			const line_y = canvas_height / 2;

			// Use a semi-transparent version of the base content
			ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)';
			ctx.lineWidth = 1;

			ctx.beginPath();
			ctx.moveTo(0, line_y);
			ctx.lineTo(canvas_width, line_y);
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
