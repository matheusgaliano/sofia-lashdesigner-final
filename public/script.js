const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const telefoneInput = document.getElementById("telefone");
const servicoSelect = document.getElementById("servico");
const dataInput = document.getElementById("data");
const horarioSelect = document.getElementById("horario");
const agendarBtn = document.getElementById("agendar-btn");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalCloseBtn = document.getElementById("modal-close-btn");

const servicos = {
  maquiagem: { duracao: 120, nome: "Maquiagem Profissional" },
  cilios: { duracao: 180, nome: "Aplicação de Cílios" },
  sobrancelha: { duracao: 90, nome: "Design de Sobrancelha" },
};

const horariosOcupados = {
  "2025-09-01": ["10:00", "11:00", "14:00"],
  "2025-09-02": ["09:00"],
};

function showMessage(title, message) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function hideModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function generateTimeSlots(duracao) {
  const slots = [];
  const startHour = 9;
  const endHour = 18;
  const interval = 15;

  let currentTime = new Date();
  currentTime.setHours(startHour, 0, 0, 0);

  const endTime = new Date();
  endTime.setHours(endHour, 0, 0, 0);

  while (currentTime <= endTime) {
    const endOfService = new Date(currentTime.getTime() + duracao * 60000);
    if (endOfService.getTime() <= endTime.getTime()) {
      const formattedTime = currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      slots.push(formattedTime);
    }
    currentTime.setMinutes(currentTime.getMinutes() + interval);
  }
  return slots;
}

function populateHorarios() {
  const selectedServico = servicoSelect.value;
  const selectedDate = dataInput.value;

  horarioSelect.innerHTML =
    '<option value="">Selecione um horário disponível</option>';

  if (!selectedServico || !selectedDate) {
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDateTime = new Date(selectedDate);
  if (selectedDateTime.toString() === "Invalid Date") {
    return;
  }

  if (selectedDateTime < today) {
    showMessage(
      "Data Inválida",
      "Não é possível agendar para uma data no passado."
    );
    return;
  }

  const duracao = servicos[selectedServico].duracao;
  const allSlots = generateTimeSlots(duracao);
  const ocupados = horariosOcupados[selectedDate] || [];

  allSlots.forEach((slot) => {
    if (!ocupados.includes(slot)) {
      const option = document.createElement("option");
      option.value = slot;
      option.textContent = slot;
      horarioSelect.appendChild(option);
    }
  });

  if (horarioSelect.options.length === 1) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Nenhum horário disponível para esta data";
    option.disabled = true;
    horarioSelect.appendChild(option);
  }
}

servicoSelect.addEventListener("change", populateHorarios);

dataInput.addEventListener("blur", populateHorarios);

modalCloseBtn.addEventListener("click", hideModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    hideModal();
  }
});

const agendarHorario = async (e) => {
  e.preventDefault();

  const nome = nomeInput.value;
  const email = emailInput.value;
  const telefone = telefoneInput.value;
  const servico = servicoSelect.value;
  const data = dataInput.value;
  const horario = horarioSelect.value;

  if (!nome || !email || !telefone || !servico || !data || !horario) {
    showMessage("Erro", "Por favor, preencha todos os campos para agendar.");
    return;
  }

  try {
    const response = await fetch("/agendar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome, email, telefone, servico, data, horario }),
    });

    const result = await response.json();

    if (response.ok) {
      const nomeServico = servicos[servico].nome;
      const dataFormatada = new Date(data).toLocaleDateString("pt-BR");
      showMessage(
        "Agendamento Confirmado!",
        `Olá, ${nome}! Seu agendamento para ${nomeServico} em ${dataFormatada} às ${horario} foi realizado com sucesso. Aguardamos você!`
      );
    } else {
      showMessage(
        "Erro no Agendamento",
        result.message || "Ocorreu um erro ao salvar o agendamento."
      );
    }
  } catch (error) {
    console.error("Erro ao enviar agendamento:", error);
    showMessage(
      "Erro de Conexão",
      "Não foi possível conectar com o servidor. Tente novamente mais tarde."
    );
  }
};
agendarBtn.addEventListener("click", agendarHorario);
