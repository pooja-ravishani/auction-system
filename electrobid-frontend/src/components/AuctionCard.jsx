import React from 'react';

export default function AuctionCard({ title = 'Untitled', currentBid = 0 }) {
	return (
		<div className="border rounded p-4 shadow-sm bg-white">
			<h3 className="font-semibold text-lg">{title}</h3>
			<p className="text-sm text-gray-600">Current bid: ${currentBid}</p>
			<button className="mt-3 px-3 py-1 bg-blue-600 text-white rounded">Place bid</button>
		</div>
	);
}
