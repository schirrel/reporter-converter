<template>
  <div>
    <UContainer class="mt-4">
      <UCard>
        <UInput
          ref="fileInput"
          color="primary"
          variant="outline"
          type="file"
          @change="setFile"
        />
        <NuxtLoading />
        <dialog ref="dialog">
          <UCard>
            <template #header>Convertendo </template>
            <UContainer class="mt-4">
              <span
                class="inset-y-0 start-0 flex items-center pointer-events-none ps-2.5"
                ><span
                  class="i-heroicons-arrow-path-20-solid flex-shrink-0 text-gray-400 dark:text-gray-500 h-5 w-5 animate-spin"
                ></span
              ></span>
            </UContainer>
          </UCard>
        </dialog>
        <template #footer>
          <UButton @click="converter">Converter</UButton>
        </template>
      </UCard>
    </UContainer>
  </div>
</template>

<script setup>
const worker = new Worker("./worker.js");
const fileInput = ref(null);
const dialog = ref(null);
const loading = ref(false);
// const itemTable = ref(null);
const results = ref([]);
let file = null;
function setFile(event) {
  file = event.target.files[0];
}
function converter() {
  //   itemTable.value.innerHTML = "";
  dialog.value.showModal();
  worker.postMessage({
    type: "convert",
    file,
  });
  //   const render = (item) => {
  //     // results.push(item);
  //     itemTable.value.innerHTML += item;
  //   };
  worker.onmessage = (event) => {
    if (event.data.type === "csv") {
        dialog.value.close();
      const encodedUri = event.data.csv;
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", file.name + ".csv");
      document.body.appendChild(link); // Required for FF

      link.click();
    }

    //     render(event.data.html);
  };
}
</script>
