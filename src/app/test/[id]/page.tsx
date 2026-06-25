import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTestIds, getTestById } from "@/lib/tests";
import { TestRunner } from "@/components/test-runner";
import { RequireAuth } from "@/components/require-auth";

export function generateStaticParams() {
  return getAllTestIds().map((id) => ({ id: String(id) }));
}

export const dynamicParams = false;

export function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return params.then(({ id }) => {
    const test = getTestById(Number(id));
    return {
      title: test ? `${test.title} — IELTS Listening Hub` : "Test — IELTS Listening Hub",
    };
  });
}

export default async function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = getTestById(Number(id));
  if (!test) notFound();
  return (
    <RequireAuth>
      <TestRunner test={test} />
    </RequireAuth>
  );
}
