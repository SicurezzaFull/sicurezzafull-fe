import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Packer, Document, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, Media, ImageRun, PageNumber, Footer, Header } from 'docx';
import { DocxService } from 'src/app/services/docx.service';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';  // Import JSZip for zipping files
import html2canvas from 'html2canvas';

import { ClientService } from 'src/app/services/client.service';
import { environment } from '../../../../environments/environment';
import { SpacesService } from 'src/app/services/spaces.service';

const API_URL = environment.endpoint;

@Component({
  selector: 'app-contratto-document',
  templateUrl: './contratto-document.component.html',
  styleUrls: ['./contratto-document.component.scss']
})
export class ContrattoDocumentComponent implements OnInit {
  generateImage() {
    throw new Error('Method not implemented.');
  }
  detailForm: FormGroup;
  clientForm: FormGroup;
  documentTypes: { label: string; value: string }[] = [
    { label: 'Contratto di Assunzione-DETERM', value: 'assunzione-determ' },
    { label: 'Cartella sanitaria', value: 'cartella-sanitaria' },
    { label: 'DPI', value: 'DPI' },
  ];

  clients: any;
  selectedClient: any;
  selectedDocumentType: any;
  images: AWS.S3.Object[];
  logoUrl: string | null = null;
  signatureUrl: string | null = null;
  imageLogoBase64: string | null = null;
  imageSignatureBase64: string | null = null;

  formDetailUserValues = null;
  formattedDataCorrente = null;
  formattedStartDate = null;
  formattedContractEndDate = null;
  formDetailClientValues = null;

  utenteTesserino: any;
  clienteTesserino: any;

  imagePreview: string | ArrayBuffer | null = 'https://via.placeholder.com/100x120';


  // Array to hold promises for document creation
  private docPromises: Promise<any>[] = [];
  // Array to hold file information for zipping
  private filesToDownload: { name: string; blob: Blob }[] = [];


  constructor(private fb: FormBuilder, private docxService: DocxService, private spacesService: SpacesService, private clientService: ClientService) {
    this.detailForm = this.fb.group({
      name: [''],
      surname: [''],
      fiscalCode: [''],
      dataCorrente: [''],
      startDate: [''],
      contractEndDate: [''],
      sector: [''],
      country: [''],
      dataNascita: [''],
      level: [''],
      duties: [''],
      workingHours: [''],
      numeroMatricola: [''],
    });

    this.clientForm = this.fb.group({
      name: [''],
      email: [''],
      phone: [''],
      address: [''],
      city: [''],
      postalCode: [''],
      country: [''],
      vat: [''],
      pec: [''],
      cfepi: [''],
      rea: [''],
      posinps: [''],
      patinail: [''],
      cassaedile: [''],
    });

  }

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0]; // Ottieni la data odierna in formato 'YYYY-MM-DD'
    this.detailForm.patchValue({
      dataCorrente: today
    });
    this.clientService.getAllClients().subscribe((clients) => {
      this.clients = clients;
      this.selectedClient = clients[0]
    });
    this.detailForm.valueChanges.subscribe(value => {
      this.utenteTesserino = value;

    });

    this.clientForm.valueChanges.subscribe(value => {
      this.clienteTesserino = value;
    });

  }


  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  downloadAsPng(): void {
    const element = document.getElementById('tesserino') as HTMLElement;
    if (element) {
      html2canvas(element).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'TESSERINO.png';
        link.click();
      });
    }
  }

  formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }



  onClientChange(event: any) {
    this.selectedClient = event.value;
    this.clientForm.patchValue({
      name: this.selectedClient.name,
      email: this.selectedClient.email,
      phone: this.selectedClient.phone,
      address: this.selectedClient.address,
      city: this.selectedClient.city,
      postalCode: this.selectedClient.postalCode,
      country: this.selectedClient.country,
      vat: this.selectedClient.vat,
      pec: this.selectedClient.pec,
      cfepi: this.selectedClient.cfepi,
      rea: this.selectedClient.rea,
      posinps: this.selectedClient.posinps,
      patinail: this.selectedClient.patinail,
      cassaedile: this.selectedClient.cassaedile,
    });
    this.clienteTesserino = this.clientForm.value;

    this.imageLogoBase64 = null;
    this.imageSignatureBase64 = null;
    this.loadClientDetails(this.selectedClient);
  }

  loadClientDetails(client: any) {
    const imageLogoKey = this.getClientImage(client.clientImages, 'logo')
    const imageSignatureKey = this.getClientImage(client.clientImages, 'signature')

    this.fetchLogoImage(imageLogoKey);
    this.fetchSignatureImage(imageSignatureKey);

  }

  getClientImage(images: any[], type: string): string | null {
    const image = images.find(img => img.type === type);
    return image ? image.keyFile : null;
  }

  async fetchLogoImage(key: string): Promise<void> {
    try {
      this.imageLogoBase64 = await this.spacesService.fetchImageBase64(key);
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  }

  async fetchSignatureImage(key: string): Promise<void> {
    try {
      this.imageSignatureBase64 = await this.spacesService.fetchImageBase64(key);
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  }

  generateFileName(documentType) {
    switch (documentType) {
      case 'assunzione-determ':
      case 'all':
        return `LETTERA_ASSUNZIONE_${this.formDetailUserValues.name}_${this.formDetailUserValues.surname}_${this.formDetailUserValues.startDate}.docx`;
      case 'DPI':
        return `DPI_${this.formDetailUserValues.name}_${this.formDetailUserValues.surname}_${this.formDetailUserValues.startDate}.docx`;
      case 'cartella-sanitaria':
        return `CARTELLA-SANITARIA_${this.formDetailUserValues.name} ${this.formDetailUserValues.surname}_${this.formDetailUserValues.startDate}.docx`;
      default:
        return 'UNKNOWN_DOCUMENT.docx';
    }
  }
  private async createDocument(documentType: string): Promise<void> {
    const dpi1 = await this.getBase64ImageFromUrl('assets/dpi/dpi1.jpg');
    const dpi2 = await this.getBase64ImageFromUrl('assets/dpi/dpi2.png');
    const dpi3 = await this.getBase64ImageFromUrl('assets/dpi/dpi3.png');
    const dpi4 = await this.getBase64ImageFromUrl('assets/dpi/dpi4.png');
    const dpi5 = await this.getBase64ImageFromUrl('assets/dpi/dpi5.png');
    const dpi6 = await this.getBase64ImageFromUrl('assets/dpi/dpi6.png');
    const dpi7 = await this.getBase64ImageFromUrl('assets/dpi/dpi7.jpg');

    let doc = null;
    if (documentType == 'assunzione-determ') {
      doc = new Document({
        sections: [
          {
            properties: {},
            headers: {
              default: new Header({
                children: [
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: this.imageLogoBase64,
                        transformation: {
                          width: 300,
                          height: 67,
                        },
                      }),
                    ],
                  }),
                ],
              }),
            },
            footers: {
              default: new Footer({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: this.formDetailClientValues.name + "-" + this.formDetailClientValues.address + "-" + this.formDetailClientValues.city,
                        size: 20,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Partita IVA " + this.formDetailClientValues.vat,
                        size: 20,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Email " + this.formDetailClientValues.email + " – PEC " + this.formDetailClientValues.pec,
                        size: 20,
                      }),
                    ],
                  }),
                ],
              }),
            },
            children: [

              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: '', break: 1 }),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun({
                    text: `Gentile Sig. ${this.formDetailUserValues.name} ${this.formDetailUserValues.surname}`,
                    size: 24,
                  }),
                  new TextRun({ text: '', break: 1 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: '', break: 1 }),
                  new TextRun(`Milano, ${this.formattedDataCorrente}`),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun({
                    text: `OGGETTO: CONTRATTO DI ASSUNZIONE A TEMPO DETERMINATO`,
                    underline: {}
                  }),
                  new TextRun({ text: '', break: 1 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun(`Facendo seguito al colloquio intercorso Vi confermiamo la Vs. assunzione alle nostre dipendenze alle seguenti condizioni:`),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun(`- INIZIO DEL RAPPORTO: ${this.formattedStartDate}`),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun(`- DURATA E TIPOLOGIA DEL RAPPORTO: Contratto a tempo determinato scadenza in data ${this.formattedContractEndDate}`),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun(`- CCNL APPLICATO: Settore ${this.formDetailUserValues.sector} a cui appartiene la nostra azienda`),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun(`- LIVELLO DI INQUADRAMENTO: Sarete inquadrato al ${this.formDetailUserValues.level}`),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun(`- MANSIONI: Le mansioni a Lei affidate saranno le seguenti: “${this.formDetailUserValues.duties}”`),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun(`- ORARIO DI LAVORO: L’orario di lavoro è di ${this.formDetailUserValues.workingHours} ore settimanali così distribuito: dal lunedì al venerdì 8 ore giornaliere.`),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun(`- RETRIBUZIONE: Si fa esplicito riferimento a quanto previsto dal vigente CCNL Edilizia Industria. Si fa inoltre presente che eventuali compensi aggiuntivi alla retribuzione stabilita dal CCNL di categoria, corrisposti come superminimi, potranno essere assorbiti, fino alla loro concorrenza, da qualsiasi aumento contrattuale e non.`),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun(`- Si riconferma che In conformità a quanto previsto dal Decreto Legislativo 81/2008 e successive modificazioni, il lavoratore si rende edotto che deve prendersi cura della propria sicurezza, della propria salute e di quella delle altre persone presenti sul luogo di lavoro, sui quali possono ricadere gli effetti delle sue azioni e/o omissioni, dichiarandosi edotto altresì che queste ultime sono punibili con le contravvenzioni e le sanzioni disciplinari previste dalla normativa vigente.`),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun(`- Il sottoscritto ${this.formDetailUserValues.name} ${this.formDetailUserValues.surname} conferma e dichiara di aver ricevuto completa informativa ai sensi dell'art. 13 del Decreto Regolamento Europeo 2016/679 GDPR ed esprime il consenso al trattamento ed alla comunicazione dei propri dati qualificati come personali del citato decreto con particolare riguardo a quelli cosiddetti sensibili nei limiti, per le finalità e per la durata precisati nell'informativa.`),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun({ text: '', break: 1 }),

                ],
              }),
              new Table({
                width: {
                  size: 100,
                  type: 'pct',
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 50, // 50% width for the first column
                          type: 'pct',
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun('Firma del lavoratore per accettazione'),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: {
                          size: 50, // 50% width for the second column
                          type: 'pct',
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun('Timbro e firma dell’azienda'),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 50, // 50% width for the first column
                          type: 'pct',
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun('FIRMA'),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: {
                          size: 50, // 50% width for the second column
                          type: 'pct',
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({ text: '', break: 1 }),
                              new ImageRun({
                                data: this.imageSignatureBase64,
                                transformation: {
                                  width: 250,
                                  height: 106,
                                },
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
                borders: {
                  top: { style: 'none' },
                  bottom: { style: 'none' },
                  left: { style: 'none' },
                  right: { style: 'none' },
                  insideHorizontal: { style: 'none' },
                  insideVertical: { style: 'none' },
                },
              }),
            ],
          },
        ],
      });
    }

    if (documentType == 'DPI') {
      doc = new Document({
        sections: [
          {
            properties: {},
            footers: {
              default: new Footer({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: this.formDetailClientValues.name + "-" + this.formDetailClientValues.address + "-" + this.formDetailClientValues.city,
                        size: 20,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Partita IVA " + this.formDetailClientValues.vat,
                        size: 20,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Email " + this.formDetailClientValues.email + " – PEC " + this.formDetailClientValues.pec,
                        size: 20,
                      }),
                    ],
                  }),
                ],
              }),
            },
            children: [

              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: `Sig. ${this.formDetailUserValues.name} ${this.formDetailUserValues.surname}`,
                    size: 24,
                  }),
                  new TextRun({ text: '', break: 1 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: '', break: 1 }),
                  new TextRun(`Milano, ${this.formattedDataCorrente}`),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun({
                    text: `OGGETTO: Fornitura dei dispositivi di protezione individuale (articolo 18, comma 1 - lett. “d” del D.Lgs. 9.4.2008, n. 81).`,
                    underline: {}
                  }),
                  new TextRun({ text: '', break: 1 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun(`In relazione allo svolgimento della sua attività lavorativa, alla mansione specifica alla quale Lei è addetto, le vengono forniti i sottoelencati dispositivi di protezione individuale (DPI):`),
                  new TextRun({ text: '', break: 1 }),

                ],
              }),
              new Table({
                width: {
                  size: 100,
                  type: 'pct',
                },
                rows: [
                  // Header Row
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("-")],
                      }),
                      new TableCell({
                        children: [new Paragraph("Descrizione DPI")],
                      }),
                      new TableCell({
                        children: [new Paragraph("Mansione/attività")],
                      }),
                      new TableCell({
                        children: [new Paragraph("Barrare")],
                      }),

                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new ImageRun({
                                data: dpi1,
                                transformation: {
                                  width: 50,
                                  height: 50,
                                },
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [new Paragraph("Calzature di sicurezza a marchio CE norma EN345-S3 – tipo antiscivolo (protezione del piede)")],
                      }),
                      new TableCell({
                        children: [new Paragraph("Tutti")],
                      }),
                      new TableCell({
                        children: [new Paragraph("X")],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new ImageRun({
                                data: dpi2,
                                transformation: {
                                  width: 50,
                                  height: 50,
                                },
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [new Paragraph("Guanti di protezione (protezione delle mani da tagli, abrasioni e contatti con materiale chimico)")],
                      }),
                      new TableCell({
                        children: [new Paragraph("Tutti")],
                      }),
                      new TableCell({
                        children: [new Paragraph("X")],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new ImageRun({
                                data: dpi3,
                                transformation: {
                                  width: 50,
                                  height: 50,
                                },
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [new Paragraph("Mascherina di protezione respiratoria FFP3 (protezione delle vie respiratorie)")],
                      }),
                      new TableCell({
                        children: [new Paragraph("Per il personale che effettua lavorazioni con agenti chimici (vedasi scheda di sicurezza)")],
                      }),
                      new TableCell({
                        children: [new Paragraph("X")],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new ImageRun({
                                data: dpi4,
                                transformation: {
                                  width: 50,
                                  height: 50,
                                },
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [new Paragraph("Casco di protezione obbligatoria (elmetto)")],
                      }),
                      new TableCell({
                        children: [new Paragraph("Tutti")],
                      }),
                      new TableCell({
                        children: [new Paragraph("X")],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new ImageRun({
                                data: dpi5,
                                transformation: {
                                  width: 50,
                                  height: 50,
                                },
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [new Paragraph("Occhiali protettivi a tenuta (protezione degli occhi)")],
                      }),
                      new TableCell({
                        children: [new Paragraph("Per il personale che effettua lavorazioni con agenti chimici (vedasi scheda di sicurezza) o con pericolo di proiezione di schegge o materiali")],
                      }),
                      new TableCell({
                        children: [new Paragraph("X")],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new ImageRun({
                                data: dpi6,
                                transformation: {
                                  width: 50,
                                  height: 50,
                                },
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [new Paragraph("Cinta individuale di protezione anticaduta")],
                      }),
                      new TableCell({
                        children: [new Paragraph("Personale esposto al rischio di caduta")],
                      }),
                      new TableCell({
                        children: [new Paragraph("")],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new ImageRun({
                                data: dpi7,
                                transformation: {
                                  width: 50,
                                  height: 50,
                                },
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [new Paragraph("Indumenti ad alta visibilità segnaletica")],
                      }),
                      new TableCell({
                        children: [new Paragraph("Tutti")],
                      }),
                      new TableCell({
                        children: [new Paragraph("X")],
                      }),
                    ],
                  })

                  // Another Content Row (without image)

                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: '', break: 1 }),
                  new TextRun({
                    text: "Ai sensi e per gli effetti di cui all’articolo 20, comma 2, lett. “d” del D.Lgs. 9.04.2008, n. 81, le è fatto obbligo di utilizzare in modo appropriato i mezzi che le vengono forniti e che l’uso improprio degli stessi è sanzionato con l’arresto sino ad un mese o con l’ammenda da € 200,00 a € 600,00.",
                    size: 18,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "I suddetti DPI dovranno essere impiegati ed indossati secondo quanto previsto nelle relative modalità di corretto utilizzo, illustrate alla S.V. contestualmente alla consegna dei suddetti DPI. Qualora i DPI non fossero più funzionali o venissero smarriti la S.V. dovrà rivolgersi al Datore di lavoro/RSPP od al preposto della Società per riceverne l’immediata sostituzione.",
                    size: 18,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "La fornitura dei suddetti mezzi di protezione viene effettuata in adempimento alla prescrizione di cui all’articolo 18, comma 1, lett. “d” del D.Lgs. 9.04.2008, n. 81.",
                    size: 18,
                  }),

                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Ad ogni buon fine, si rammenta che è assolutamente vietato svolgere attività che comportano rischi per la salute e sicurezza dei lavoratori in assenza dei relativi DPI.",
                    size: 18,
                  }),
                  new TextRun({ text: '', break: 1 }),

                ],
              }),
              new Paragraph({
                children: [
                  new TextRun(`Per ricevuta dei dispositivi di protezione sopra elencati: `),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun(`Data ${this.formattedDataCorrente}`),
                  new TextRun({ text: '', break: 1 }),

                ],
              }),

              new Table({
                width: {
                  size: 100,
                  type: 'pct',
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 50, // 50% width for the first column
                          type: 'pct',
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun('Firma del lavoratore per accettazione'),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: {
                          size: 50, // 50% width for the second column
                          type: 'pct',
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun('Timbro e firma dell’azienda'),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 50, // 50% width for the first column
                          type: 'pct',
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun('FIRMA'),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: {
                          size: 50, // 50% width for the second column
                          type: 'pct',
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({ text: '', break: 1 }),
                              new ImageRun({
                                data: this.imageSignatureBase64,
                                transformation: {
                                  width: 250,
                                  height: 106,
                                },
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
                borders: {
                  top: { style: 'none' },
                  bottom: { style: 'none' },
                  left: { style: 'none' },
                  right: { style: 'none' },
                  insideHorizontal: { style: 'none' },
                  insideVertical: { style: 'none' },
                },
              }),
            ],
          },
        ],
      });
    }

    if (documentType == 'cartella-sanitaria') {
      doc = new Document({
        sections: [
          {
            properties: {

            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "CARTELLA SANITARIA E DI RISCHIO",
                    bold: true,
                    size: 20,
                  }),
                  new TextRun({ text: '', break: 1 }),
                ],
              }),
              new Table({
                width: {
                  size: 100,
                  type: 'pct',
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 50,
                          type: 'pct',
                        },
                        children: [
                          new Paragraph({
                            children: [

                              new TextRun(`Data: ${this.formattedDataCorrente}`),

                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: {
                          size: 50,
                          type: 'pct',
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun(`Nominativo: ${this.formDetailUserValues.name + ' ' + this.formDetailUserValues.surname}`),
                              new TextRun({ text: '', break: 1 }),
                              new TextRun(`Luogo e data di nascita: ${this.formDetailUserValues.country}, ${this.formDetailUserValues.dataNascita}`),
                              new TextRun({ text: '', break: 1 }),
                              new TextRun(`Mansione: ${this.formDetailUserValues.duties}`),
                              new TextRun({ text: '', break: 1 }),
                              new TextRun(`Azienda: ${this.formDetailClientValues.name}`),
                              new TextRun({ text: '', break: 1 }),
                            ],
                          }),
                        ],
                      }),

                    ],
                  }),
                ],
                borders: {
                  top: { style: 'none' },
                  bottom: { style: 'none' },
                  left: { style: 'none' },
                  right: { style: 'none' },
                  insideHorizontal: { style: 'none' },
                  insideVertical: { style: 'none' },
                },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: '', break: 1 }),
                ],
              }),
              new Table({
                width: {
                  size: 100,
                  type: 'pct',
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 50,
                          type: 'pct',
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: 'ATTIVITA’ LAVORATIVA A RISCHIO ESPOSIZIONE COVID 19: ', bold: true, size: 18 }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: {
                          size: 10,
                          type: 'pct',
                        },
                        children: [
                          new Paragraph({
                            children: [
                              this.createCheckboxSquare24(), // Insert the checkbox symbol
                              new TextRun({
                                text: " ALTO", // Label next to the checkbox
                                font: {
                                  name: "Arial", // Font for the label
                                },
                                size: 18, // Adjust size as needed
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: {
                          size: 10,
                          type: 'pct',
                        },
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare24(), // Insert the checkbox symbol
                            new TextRun({
                              text: " MEDIO", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 18, // Adjust size as needed
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        width: {
                          size: 10,
                          type: 'pct',
                        },
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare24(), // Insert the checkbox symbol
                            new TextRun({
                              text: " BASSO", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 18, // Adjust size as needed
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                ],
                borders: {
                  top: { style: 'none' },
                  bottom: { style: 'none' },
                  left: { style: 'none' },
                  right: { style: 'none' },
                  insideHorizontal: { style: 'none' },
                  insideVertical: { style: 'none' },
                },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: '', break: 1 }),
                ],
              }),
              new Table({
                width: {
                  size: 100,
                  type: 'pct',
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,

                        width: { size: 50, type: 'pct' }, // Set the width to 50%
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Ha già svolto simili mansioni?",
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "SI", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "NO", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' }, // Set the width to 50%
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Al lavoro usa mezzi (muletti, gru, escavatori ecc.)? ",
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "SI", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "NO", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' }, // Set the width to 50%
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Nella sua famiglia ci sono patologie particolari?",
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "SI", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "NO", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' }, // Set the width to 50%
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Attualmente assume farmaci?",
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "SI", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "NO", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' }, // Set the width to 50%
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Soffre di diabete?",
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "SI", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "NO", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' }, // Set the width to 50%
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Soffre di ipertensione?",
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "SI", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "NO", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' }, // Set the width to 50%
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Fa uso di alcolici?",
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "SI", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "NO", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' }, // Set the width to 50%
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Fa uso di tabacco?",
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "SI", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "NO", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' },
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Ha mai fatto uso di sostanze stupefacenti?",
                              font: {
                                name: "Arial",
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(),
                            new TextRun({
                              text: "SI",
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(),
                            new TextRun({
                              text: "NO",
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' },
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Se sì, quando ultima volta?",
                              font: {
                                name: "Arial",
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "", // Campo vuoto per risposta
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "", // Campo vuoto per risposta
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' },
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Ci sente bene?",
                              font: {
                                name: "Arial",
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(),
                            new TextRun({
                              text: "SI",
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(),
                            new TextRun({
                              text: "NO",
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' },
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Ci vede bene?",
                              font: {
                                name: "Arial",
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(),
                            new TextRun({
                              text: "SI",
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(),
                            new TextRun({
                              text: "NO",
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' },
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Ha subito operazioni chirurgiche?",
                              font: {
                                name: "Arial",
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(),
                            new TextRun({
                              text: "SI",
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(),
                            new TextRun({
                              text: "NO",
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' },
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Ha mai subito fratture?",
                              font: {
                                name: "Arial",
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(),
                            new TextRun({
                              text: "SI",
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(),
                            new TextRun({
                              text: "NO",
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' },
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Soffre abitualmente di mal di schiena?",
                              font: {
                                name: "Arial",
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(),
                            new TextRun({
                              text: "SI",
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(),
                            new TextRun({
                              text: "NO",
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' },
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Soffre di dolori a spalle, gomiti e polsi?",
                              font: {
                                name: "Arial",
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(),
                            new TextRun({
                              text: "SI",
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(),
                            new TextRun({
                              text: "NO",
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' },
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Ha mai subito infortuni sul lavoro?",
                              font: {
                                name: "Arial",
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(),
                            new TextRun({
                              text: "SI",
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(),
                            new TextRun({
                              text: "NO",
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' },
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Se sì, descriva il tipo di infortunio.",
                              font: {
                                name: "Arial",
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "", // Campo vuoto per risposta
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "", // Campo vuoto per risposta
                              font: {
                                name: "Arial",
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                ],
                borders: {
                  top: { style: 'none' },
                  bottom: { style: 'none' },
                  left: { style: 'none' },
                  right: { style: 'none' },
                  insideHorizontal: { style: 'none' },
                  insideVertical: { style: 'none' },
                },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: '', break: 1 }),
                  new TextRun({ text: 'Vaccinazioni:', bold: true }),
                ],
              }),
              new Table({
                width: {
                  size: 100,
                  type: 'pct',
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' }, // Set the width to 50%
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Covid",
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "SI", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "NO", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        width: { size: 50, type: 'pct' }, // Set the width to 50%
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "Antitetanica",
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 24,
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "SI", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare20(), // Insert the checkbox symbol
                            new TextRun({
                              text: "NO", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                ],
                borders: {
                  top: { style: 'none' },
                  bottom: { style: 'none' },
                  left: { style: 'none' },
                  right: { style: 'none' },
                  insideHorizontal: { style: 'none' },
                  insideVertical: { style: 'none' },
                },
              }),

              new Paragraph({
                children: [
                  new TextRun({ text: '', break: 1 }),
                  new TextRun({
                    text: "Esame obiettivo:",
                    bold: true,
                  }),
                  new TextRun(`Altezza(cm) _________ peso(kg)___________	PA_________ FC______SAT02_____Temp______`),
                  new TextRun({ text: '', break: 1 }),
                ],
              }),

              new Table({
                width: {
                  size: 100,
                  type: 'pct',
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare24(), // Insert the checkbox symbol
                            new TextRun({
                              text: "IDONEO", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 18, // Adjust size as needed
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare24(), // Insert the checkbox symbol
                            new TextRun({
                              text: "NON IDONEO", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 18, // Adjust size as needed
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),

                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare24(), // Insert the checkbox symbol
                            new TextRun({
                              text: "IDONEO CON LIMITAZIONI _____________", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 18, // Adjust size as needed
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare24(), // Insert the checkbox symbol
                            new TextRun({
                              text: "IDONEO CON PRESCRIZIONI ______________", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 18, // Adjust size as needed
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),

                  new TableRow({
                    children: [
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            this.createCheckboxSquare24(), // Insert the checkbox symbol
                            new TextRun({
                              text: "PERMANENTEMENTE INIDONEO", // Label next to the checkbox
                              font: {
                                name: "Arial", // Font for the label
                              },
                              size: 18, // Adjust size as needed
                            }),
                          ],
                        }),],
                      }),
                      new TableCell({
                        borders: null,
                        children: [new Paragraph({
                          children: [
                            new TextRun({
                              text: "", // Label next to the checkbox
                              size: 18, // Adjust size as needed
                            }),
                          ],
                        }),],
                      }),
                    ],
                  }),
                ],
                borders: {
                  top: { style: 'none' },
                  bottom: { style: 'none' },
                  left: { style: 'none' },
                  right: { style: 'none' },
                  insideHorizontal: { style: 'none' },
                  insideVertical: { style: 'none' },
                },
              }),

              new Paragraph({
                children: [
                  new TextRun({ text: '', break: 1 }),
                  new TextRun({
                    text: "Firmo la mia cartella per:",
                    bold: true,
                  }),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun(" 1. Confermare responsabilmente le notizie date sulla mia passata e presente salute"),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun(" 2. Dichiarare di avere ricevuto esaurienti informazioni sul risultato e il significato degli accertamenti clinici effettuati e del giudizio alla mansione espresso."),
                  new TextRun({ text: '', break: 1 }),
                  new TextRun(" 3. Dare il mio consenso a trattare i miei dati personali in base alle informazioni da me fornite."),
                  new TextRun({ text: '', break: 1 }),
                ],
              }),

              new Table({
                width: {
                  size: 100,
                  type: 'pct',
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 50, // 50% width for the first column
                          type: 'pct',
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun('Firma del lavoratore'),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: {
                          size: 50, // 50% width for the second column
                          type: 'pct',
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun('Firma del medico'),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 50, // 50% width for the first column
                          type: 'pct',
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun('FIRMA'),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: {
                          size: 50, // 50% width for the second column
                          type: 'pct',
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun('FIRMA'),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
                borders: {
                  top: { style: 'none' },
                  bottom: { style: 'none' },
                  left: { style: 'none' },
                  right: { style: 'none' },
                  insideHorizontal: { style: 'none' },
                  insideVertical: { style: 'none' },
                },
              }),
            ],
          },

        ],
      });
    }


    return Packer.toBlob(doc).then(blob => {
      let fileName = this.generateFileName(documentType);
      this.filesToDownload.push({ name: fileName, blob });

    });

  }

  // Function to handle creating all documents
  private createAllDocuments(all): void {


    this.formDetailUserValues = this.detailForm.value;

    this.formattedDataCorrente = this.formatDate(this.formDetailUserValues.dataCorrente);
    this.formattedStartDate = this.formatDate(this.formDetailUserValues.startDate);
    this.formattedContractEndDate = this.formatDate(this.formDetailUserValues.contractEndDate);


    this.formDetailClientValues = this.clientForm.value;

    // Check the selected document type and create the respective documents
    if (this.selectedDocumentType === 'assunzione-determ' || all) {
      this.docPromises.push(this.createDocument('assunzione-determ'));
    }

    if (this.selectedDocumentType === 'DPI' || all) {

      this.docPromises.push(this.createDocument('DPI'));
    }

    if (this.selectedDocumentType === 'cartella-sanitaria' || all) {
      this.docPromises.push(this.createDocument('cartella-sanitaria'));
    }
  }

  createTesserino(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const elementToCapture = document.getElementById('tesserino') as HTMLElement;

      if (elementToCapture) {
        html2canvas(elementToCapture).then((canvas) => {
          canvas.toBlob((blob) => {
            if (blob) {
              this.filesToDownload.push({
                name: `Tesserino_${this.formDetailUserValues.name}_${this.formDetailUserValues.surname}_${this.formDetailUserValues.startDate}.png`,
                blob: blob
              });
              resolve(); // Resolve the promise when successful
            } else {
              reject('Blob creation failed');
            }
          });
        }).catch((error) => {
          console.error('Error capturing element:', error);
          reject(error);
        });
      } else {
        reject('Tesserino element not found');
      }
    });
  }


  // Function to download a single selected document
  downloadSingleDocument(): void {
    this.filesToDownload = [];
    this.createAllDocuments(false);

    Promise.all(this.docPromises).then(() => {
      if (this.filesToDownload.length > 0) {
        saveAs(this.filesToDownload[0].blob, this.filesToDownload[0].name);
      }
    }).catch(error => {
      console.error('Error creating documents:', error);
    });
  }

  // Function to download all documents as a zip
  downloadAllDocuments(): void {
    this.createAllDocuments(true);
    this.createTesserino();
    Promise.all(this.docPromises).then(() => {
      if (this.filesToDownload.length > 1) {
        const zip = new JSZip();
        this.filesToDownload.forEach(file => {
          zip.file(file.name, file.blob);
        });

        zip.generateAsync({ type: 'blob' }).then(zipBlob => {
          saveAs(zipBlob, `Documents_${this.formDetailUserValues.name}_${this.formDetailUserValues.surname}_${this.formDetailUserValues.startDate}.zip`);
        });
      } else if (this.filesToDownload.length === 1) {
        saveAs(this.filesToDownload[0].blob, this.filesToDownload[0].name);
      }
    }).catch(error => {
      console.error('Error creating documents:', error);
    });

  }

  async getBase64ImageFromUrl(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  createCheckboxSquare24() {
    // Unicode character for square checkbox (using Wingdings font)
    const checkboxSymbol = '\u2610'; // Unicode for an empty square checkbox

    return new TextRun({
      text: checkboxSymbol,
      font: {
        name: "Arial Unicode MS", // Font with square checkbox symbol (e.g., Arial Unicode MS)
      },
      size: 18, // Adjust size as needed
    });
  }

  createCheckboxSquare20() {
    // Unicode character for square checkbox (using Wingdings font)
    const checkboxSymbol = '\u2610'; // Unicode for an empty square checkbox

    return new TextRun({
      text: checkboxSymbol,
      font: {
        name: "Arial Unicode MS", // Font with square checkbox symbol (e.g., Arial Unicode MS)
      },
      size: 18, // Adjust size as needed
    });
  }

  getBase64Image(bufferArray, mimeType = 'image/png') {
    return `data:${mimeType};base64,${bufferArray}`;
  }

}
