const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const dbURI =
  "mongodb+srv://matheusgaliano_db_user:aGOGKfYbdKPRbzaM@cluster0.f8mdxxm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(dbURI)
  .then(() => {
    console.log("Conexão com o MongoDB estabelecida com sucesso.");
  })
  .catch((err) => {
    console.error("Erro ao conectar ao MongoDB:", err);
  });

const agendamentoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  telefone: { type: String, required: true },
  servico: { type: String, required: true },
  data: { type: String, required: true },
  horario: { type: String, required: true },
  dataAgendamento: { type: Date, default: Date.now },
});

const Agendamento = mongoose.model("Agendamento", agendamentoSchema);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "scheduler.html"));
});

app.post("/agendar", async (req, res) => {
  try {
    const { nome, email, telefone, servico, data, horario } = req.body;

    if (!nome || !email || !telefone || !servico || !data || !horario) {
      return res
        .status(400)
        .json({ message: "Todos os campos são obrigatórios." });
    }

    const novoAgendamento = new Agendamento({
      nome,
      email,
      telefone,
      servico,
      data,
      horario,
    });

    await novoAgendamento.save();

    console.log("Agendamento salvo:", novoAgendamento);

    res.status(201).json({
      message: "Agendamento salvo com sucesso!",
      agendamento: novoAgendamento,
    });
  } catch (error) {
    console.error("Erro ao salvar agendamento:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

app.get("/agendamentos", async (req, res) => {
  try {
    const { data, servico } = req.query;
    const filtro = {};

    if (data) {
      filtro.data = data;
    }
    if (servico) {
      filtro.servico = servico;
    }

    const agendamentos = await Agendamento.find(filtro).sort({
      data: 1,
      horario: 1,
    });
    res.status(200).json(agendamentos);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

app.get("/encontrar-agendamento", async (req, res) => {
  try {
    const { email, data } = req.query;
    if (!email || !data) {
      return res
        .status(400)
        .json({ message: "E-mail e data são obrigatórios." });
    }

    const agendamento = await Agendamento.findOne({ email: email, data: data });

    if (!agendamento) {
      return res.status(404).json({ message: "Agendamento não encontrado." });
    }

    res.status(200).json(agendamento);
  } catch (error) {
    console.error("Erro ao encontrar agendamento:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

app.get("/horarios-ocupados", async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) {
      return res
        .status(400)
        .json({ message: 'O parâmetro "data" é obrigatório.' });
    }

    const agendamentos = await Agendamento.find({ data: data });
    const horariosOcupados = agendamentos.map(
      (agendamento) => agendamento.horario
    );

    res.status(200).json(horariosOcupados);
  } catch (error) {
    console.error("Erro ao buscar horários ocupados:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

app.delete("/agendamentos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Agendamento.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Agendamento não encontrado." });
    }

    console.log("Agendamento excluído com sucesso:", id);
    res.status(200).json({ message: "Agendamento excluído com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir agendamento:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
