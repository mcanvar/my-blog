<script context="module">
	export function preload() {
		return this.fetch(`en.json`).then(r => r.json()).then(posts => {
			return { posts };
		});
	}
</script>

<script>
	export let posts;
</script>

<style>
	h1, figure {
		text-align: center;
		margin: 0 auto;
	}

	h1 {
		font-size: 2.8em;
		text-transform: uppercase;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}

	figure {
		margin: 0 0 1em 0;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>

<svelte:head>
	<meta http-equiv="Content-Language" content="en-US">
	<title>Mevlut Canvar's Blog</title>
</svelte:head>

<h1>Selam :)</h1>

<figure>
	<figcaption>Slience is yellow here!</figcaption>
</figure>

<h1>Recent posts</h1>

<ul>
	{#each posts as post}
		<!-- we're using the non-standard `rel=prefetch` attribute to
				tell Sapper to load the data for the page as soon as
				the user hovers over the link or taps it, instead of
				waiting for the 'click' event -->
		<li><a rel="prefetch" href="en/{post.slug}">{post.title}</a></li>
	{/each}
</ul>

<a class="twitter-timeline" href="https://twitter.com/mevlutcanvar?ref_src=twsrc%5Etfw">Tweets by mevlutcanvar</a>
