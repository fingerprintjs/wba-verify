<script lang="ts">
	let count = $state(0);
	
	function increment() {
		count += 1;
	}
	
	function decrement() {
		count -= 1;
	}
</script>

<div class="counter">
	<button onclick={decrement}>-</button>
	<span class="count">{count}</span>
	<button onclick={increment}>+</button>
</div>

<style>
	.counter {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin: 2rem 0;
	}
	
	button {
		background: rgb(var(--accent));
		color: white;
		border: none;
		border-radius: 4px;
		padding: 0.5rem 1rem;
		font-size: 1.5rem;
		cursor: pointer;
		transition: background 0.2s;
		min-width: 3rem;
	}
	
	button:hover {
		background: rgb(var(--accent-dark));
	}
	
	.count {
		font-size: 2rem;
		font-weight: bold;
		min-width: 3rem;
		text-align: center;
		color: rgb(var(--accent-light));
	}
</style>
