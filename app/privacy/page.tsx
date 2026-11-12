export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: November 2026</p>

      <section className="space-y-4">
        <p>
          This is a self-hosted installation of ReplyPlus, an open-source tool, run by the owner of the
          connected Instagram account for their own use. It uses the Instagram API to auto-reply to
          messages and comments on that account.
        </p>

        <h2 className="text-xl font-semibold mt-6">Data We Collect</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Instagram profile information (username, name, profile picture)</li>
          <li>Instagram content (media, captions, comments)</li>
          <li>Messages and conversations (for auto-reply features)</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">How We Use Data</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>To post content to your Instagram account when you request it</li>
          <li>To send automated replies to messages and comments</li>
          <li>To display analytics about your account performance</li>
          <li>We do <strong>not</strong> sell your data to third parties</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">Data Storage</h2>
        <p>
          Your Instagram access tokens and profile data are stored securely in
          the owner&apos;s own database (Supabase). You can disconnect your account at any time,
          which will remove the stored tokens.
        </p>

        <h2 className="text-xl font-semibold mt-6">Contact</h2>
        <p>
          For any questions, contact the owner of the Instagram account that sent you the message.
        </p>
      </section>
    </div>
  )
}
