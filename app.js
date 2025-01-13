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

// Fonction pour charger les clients
function loadClients(filterCin = '') {
    const clientsRef = database.ref('patients/');
    clientsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        const tableBody = document.getElementById('clientTableBody');
        tableBody.innerHTML = '';

        if (data) {
            Object.values(data).forEach(client => {
                if (!filterCin || client.cin.includes(filterCin)) {
                    const age = calculateAge(client.dateNaissance);
                    tableBody.innerHTML += `
                        <tr>
                            <td>${client.cin}</td>
                            <td>${client.nom}</td>
                            <td>${client.prenom}</td>
                            <td>${age}</td>
                            <td>${client.adresse}</td>
                            <td>
                                <button class="btn btn-info btn-sm" onclick="showAddMaladieForm('${client.cin}')">Ajouter Maladie</button>
                                <button class="btn btn-info btn-sm" onclick="showMaladieHistory('${client.cin}')">Voir Maladies</button>
                                <button class="btn btn-detailed btn-sm" onclick="showPatientDetails('${client.cin}')">Détails</button>
                            </td>
                        </tr>
                    `;
                }
            });
        }
    });
}

// Fonction pour calculer l'âge
function calculateAge(dateNaissance) {
    const birthDate = new Date(dateNaissance);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// Fonction pour afficher le formulaire d'ajout de maladie
function showAddMaladieForm(cin) {
    document.getElementById('addMaladieContainer').style.display = 'block';
    document.getElementById('maladieCin').value = cin;
}

// Fonction pour afficher l'historique des maladies
function showMaladieHistory(cin) {
    document.getElementById('maladieTableContainer').style.display = 'block';
    document.getElementById('clientFormContainer').style.display = 'none';
    document.getElementById('hideMaladieBtn').style.display = 'block';
    loadClientHistory(cin);
}

// Fonction pour charger l'historique des maladies
function loadClientHistory(cin) {
    const clientRef = database.ref('patients/' + cin + '/history');
    clientRef.once('value', (snapshot) => {
        const data = snapshot.val();
        const tableBody = document.getElementById('maladieTableBody');
        tableBody.innerHTML = '';

        if (data) {
            Object.values(data).forEach(record => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${cin}</td>
                        <td>${new Date(record.date).toLocaleDateString()}</td>
                        <td>${record.typeMaladie}</td>
                        <td>${record.medicaments}</td>
                    </tr>
                `;
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="5">Aucun historique trouvé.</td></tr>';
        }
    });
}

// Événement pour le formulaire de client
document.getElementById('clientForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const cin = document.getElementById('cin').value;
    const nom = document.getElementById('nom').value;
    const prenom = document.getElementById('prenom').value;
    const dateNaissance = document.getElementById('dateNaissance').value;
    const adresse = document.getElementById('adresse').value;

    const clientRef = database.ref('patients/' + cin);

    clientRef.set({
        cin: cin,
        nom: nom,
        prenom: prenom,
        dateNaissance: dateNaissance,
        adresse: adresse
    }).then(() => {
        document.getElementById('confirmationMessage').classList.remove('d-none');
        setTimeout(() => {
            document.getElementById('confirmationMessage').classList.add('d-none');
        }, 3000);
        document.getElementById('clientForm').reset();
        document.getElementById('clientFormContainer').style.display = 'none';
        loadClients();
    }).catch((error) => {
        console.error('Erreur lors de l\'ajout ou de la mise à jour du client:', error);
    });
});

// Événement pour le formulaire de maladie
document.getElementById('maladieForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const cin = document.getElementById('maladieCin').value;
    const typeMaladie = document.getElementById('maladieType').value;
    const medicaments = document.getElementById('maladieMedicaments').value;
    const date = new Date().toISOString();

    const maladieRef = database.ref('patients/' + cin + '/history').push();
    maladieRef.set({
        date: date,
        typeMaladie: typeMaladie,
        medicaments: medicaments
    }).then(() => {
        document.getElementById('maladieForm').reset();
        loadClientHistory(cin);
    }).catch((error) => {
        console.error('Erreur lors de l\'ajout de la maladie:', error);
    });
});

// Charger les clients lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => loadClients());