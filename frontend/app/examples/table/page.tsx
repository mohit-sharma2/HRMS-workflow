'use client';

import { ColumnDef } from "@tanstack/react-table";
import { DataTable, FilterConfig } from "../../../components/table/DataTable";
import { useMemo } from "react";

// Deterministic RNG to avoid SSR/CSR hydration mismatches
function createRng(seed: number) {
	let state = seed >>> 0;
	return function rng() {
		// LCG parameters (Numerical Recipes)
		state = (1664525 * state + 1013904223) >>> 0;
		return state / 0xffffffff;
	};
}

type Row = {
	id: number;
	name: string;
	status: "active" | "inactive" | "pending";
	updatedBy: "Accountant" | "Dataops" | "PI";
	size: number;
	createdAt: string; // ISO date
};

const columns: ColumnDef<Row>[] = [
	{
		accessorKey: "id",
		header: "ID",
		cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span>,
	},
	{
		accessorKey: "name",
		header: "Name",
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ getValue }) => {
			const v = getValue<Row["status"]>();
			const color =
				v === "active" ? "bg-green-100 text-green-800" :
				v === "inactive" ? "bg-red-100 text-red-800" :
				"bg-yellow-100 text-yellow-800";
			return <span className={`rounded px-2 py-0.5 text-xs ${color}`}>{v}</span>;
		},
	},
	{
		accessorKey: "updatedBy",
		header: "Last Updated By",
	},
	{
		accessorKey: "size",
		header: "Size",
		cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span>,
	},
	{
		accessorKey: "createdAt",
		header: "Created",
		cell: ({ getValue }) => {
			const iso = new Date(getValue<string>()).toISOString().slice(0, 10);
			return <span className="tabular-nums">{iso}</span>;
		},
	},
];

function makeData(seed = 42): Row[] {
	const rng = createRng(seed);
	const statuses: Row["status"][] = ["active", "inactive", "pending"];
	const updaters: Row["updatedBy"][] = ["Accountant", "Dataops", "PI"];
	const names = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Kappa", "Omega"];
	const out: Row[] = [];
	for (let i = 1; i <= 137; i++) {
		const daysAgo = Math.floor(rng() * 365);
		const base = new Date("2024-01-01T00:00:00Z");
		const date = new Date(base.getTime() - daysAgo * 24 * 60 * 60 * 1000);
		out.push({
			id: i,
			name: names[i % names.length] + " " + i,
			status: statuses[i % statuses.length],
			updatedBy: updaters[i % updaters.length],
			size: Math.floor(rng() * 1000),
			createdAt: date.toISOString(),
		});
	}
	return out;
}

export default function ExampleTablePage() {
	const data = useMemo(() => makeData(), []);
	const filters: FilterConfig = [
		{ type: "search", placeholder: "Search…" },
		// Drawer filters like the screenshot
		{
			type: "checkboxGroup",
			columnId: "updatedBy",
			label: "Last Updated By",
			options: [
				{ label: "Afshan Accountant", value: "Accountant" },
				{ label: "Afshan Dataops", value: "Dataops" },
				{ label: "Afshan PI", value: "PI" },
			],
		},
		{ type: "dateRange", columnId: "createdAt", label: "Created On" },
		{ type: "numberRange", columnId: "size", label: "Size" },
	];

	const quickFiltersTopBar = [
		{
			type: "select" as const,
			columnId: "status",
			label: "All Status",
			options: [
				{ label: "Active", value: "active" },
				{ label: "Inactive", value: "inactive" },
				{ label: "Pending", value: "pending" },
			],
		},
	];
	return (
		<div className="mx-auto w-full max-w-5xl p-6">
			<h1 className="mb-4 text-2xl font-semibold">Data Table Example</h1>
			<DataTable<Row>
				data={data}
				columns={columns}
				pageSizeOptions={[10, 20, 50]}
				initialPageSize={10}
				filters={filters}
				quickFiltersTopBar={quickFiltersTopBar}
				className="rounded-md"
			/>
		</div>
	);
}


