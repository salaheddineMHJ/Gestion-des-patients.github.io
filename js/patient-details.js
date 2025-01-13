
        // Configuration Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyCSwDwN0kwekR6U0V_FGnEM5JecyKmXWLI",
            authDomain: "haja-d4b91.firebaseapp.com",
            databaseURL: "https://haja-d4b91-default-rtdb.firebaseio.com",
            projectId: "haja-d4b91",
            storageBucket: "haja-d4b91.appspot.com",
            messagingSenderId: "1680817769",
            appId: "1:1680817769:web:c5b0410064c2911e116cf8",
            measurementId: "G-DQEWC6LZPG"
        };

        // Initialiser Firebase
        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();

        // Récupérer le CIN depuis les paramètres d'URL
        const urlParams = new URLSearchParams(window.location.search);
        const cin = urlParams.get('cin');

        // Charger les détails du patient depuis Firebase
        function loadPatientDetails() {
            const clientRef = database.ref('patients/' + cin);
            clientRef.once('value', (snapshot) => {
                const data = snapshot.val();
                const container = document.getElementById('patientDetails');
                
                if (data) {
                    const age = calculateAge(data.dateNaissance);
                    container.innerHTML = `
                        <h2>Informations du Patient</h2>
                        <ul class="list-group">
                            <li class="list-group-item"><strong>CIN:</strong> ${data.cin}</li>
                            <li class="list-group-item"><strong>Nom:</strong> ${data.nom}</li>
                            <li class="list-group-item"><strong>Prénom:</strong> ${data.prenom}</li>
                            <li class="list-group-item"><strong>Date de Naissance:</strong> ${data.dateNaissance}</li>
                            <li class="list-group-item"><strong>Âge:</strong> ${age}</li>
                            <li class="list-group-item"><strong>Adresse:</strong> ${data.adresse}</li>
                        </ul>
                        <h3 class="mt-4">Historique des Maladies</h3>
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type de Maladie</th>
                                    <th>Médicaments</th>
                                </tr>
                            </thead>
                            <tbody id="maladieHistoryTableBody">
                                <!-- L'historique sera ajouté ici dynamiquement -->
                            </tbody>
                        </table>
                    `;
                    loadPatientHistory();
                } else {
                    container.innerHTML = '<p>Patient non trouvé.</p>';
                }
            });
        }

        // Charger l'historique des maladies du patient
        function loadPatientHistory() {
            const historyRef = database.ref('patients/' + cin + '/history');
            historyRef.once('value', (snapshot) => {
                const data = snapshot.val();
                const tableBody = document.getElementById('maladieHistoryTableBody');
                tableBody.innerHTML = '';

                if (data) {
                    Object.values(data).forEach(record => {
                        tableBody.innerHTML += `
                            <tr>
                                <td>${new Date(record.date).toLocaleDateString()}</td>
                                <td>${record.typeMaladie}</td>
                                <td>${record.medicaments}</td>
                            </tr>
                        `;
                    });
                } else {
                    tableBody.innerHTML = '<tr><td colspan="3">Aucun historique trouvé.</td></tr>';
                }
            });
        }

        // Calculer l'âge à partir de la date de naissance
        function calculateAge(dateNaissance) {
            const birthDate = new Date(dateNaissance);
            const ageDifMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDifMs);
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        // Charger les détails du patient lors du chargement de la page
        document.addEventListener('DOMContentLoaded', loadPatientDetails);
