<script lang="ts">
const policyItems: Array<{ title: string; content: string }> = [
  {
    title: "Information Collection",
    content: "We collect information you provide directly to us when using our services."
  },
  {
    title: "Use of Information",
    content: "We use the information we collect to provide, maintain, and improve our services."
  },
  {
    title: "Data Sharing",
    content: "We do not sell your personal information. We may share data with service providers or for legal reasons."
  },
  {
    title: "Data Security",
    content: "We implement measures to protect your data, but no method of transmission is 100% secure."
  },
  {
    title: "Your Rights",
    content: "You have the right to access, correct, or delete your personal information."
  },
  {
    title: "Changes to Policy",
    content: "We may update this policy from time to time. We will notify you of any changes by posting the new policy on this page."
  }
];
</script>

<div class="container mx-auto px-4 pt-16 pb-8">
  <h1 class="text-3xl font-bold mb-6">Privacy Policy</h1>
  <p class="mb-6">Last updated: {new Date().toLocaleDateString()}</p>
  
  <div class="space-y-6">
    {#each policyItems as item}
      <div class="bg-gray-100 p-4 rounded-lg">
        <h2 class="text-xl font-semibold mb-2">{item.title}</h2>
        <p>{item.content}</p>
      </div>
    {/each}
  </div>
  
  <p class="mt-8 text-sm text-gray-600">
    If you have any questions about this Privacy Policy, please contact us.
  </p>
</div>

