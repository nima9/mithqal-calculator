<!-- PayPal.svelte - Pixelated PayPal logo icon -->
<script lang="ts">
  type Props = {
    color?: string;
    size?: number;
  };

  let { color = "currentColor", size = 16 }: Props = $props();

  let sizeValue = $derived(`${size}px`);
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  fill={color}
  viewBox="0 0 24 24"
  width={sizeValue}
  height={sizeValue}
>
  <g fill={color} shape-rendering="crispEdges">
    <!-- Pixelated capital P -->
    <rect x="5" y="4" width="3" height="16" />
    <rect x="8" y="4" width="7" height="2" />
    <rect x="13" y="6" width="2" height="4" />
    <rect x="8" y="10" width="7" height="2" />
    <rect x="8" y="12" width="4" height="2" />
  </g>
</svg>
