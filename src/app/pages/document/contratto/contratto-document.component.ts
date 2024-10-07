import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Packer, Document, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, Media, ImageRun, PageNumber, Footer, Header } from 'docx';
import { DocxService } from 'src/app/services/docx.service';
import { saveAs } from 'file-saver';
import { ClientService } from 'src/app/services/client.service';
import { environment } from '../../../../environments/environment';

const API_URL = environment.endpoint;

@Component({
  selector: 'app-contratto-document',
  templateUrl: './contratto-document.component.html',
  styleUrls: ['./contratto-document.component.scss']
})
export class ContrattoDocumentComponent implements OnInit {
  detailForm: FormGroup;
  documentTypes: { label: string; value: string }[] = [
    { label: 'Contratto di Assunzione-DETERM', value: 'assunzione-determ' },
    { label: 'Lettera di Assunzione', value: 'lettera' },
    // Add more document types as needed
  ];
  clients: any;
  selectedClient: any;
  selectedDocumentType: any;

  constructor(private fb: FormBuilder, private docxService: DocxService, private clientService: ClientService) {
    this.detailForm = this.fb.group({
      name: [''],
      surname: [''],
      dataCorrente: [''],
      startDate: [''],
      contractEndDate: [''],
      sector: [''],
      level: [''],
      duties: [''],
      workingHours: [''],

    });
  }

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0]; // Ottieni la data odierna in formato 'YYYY-MM-DD'
    this.detailForm.patchValue({
      dataCorrente: today
    });
    this.clientService.getAllClients().subscribe((clients) => {
      this.clients = clients;
    });
  }

  formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  async generateUserDocx(): Promise<void> {

    console.log("selectedClient", this.selectedClient);
    console.log("selectedDocumentType", this.selectedDocumentType);

    const formValues = this.detailForm.value;

    const formattedDataCorrente = this.formatDate(formValues.dataCorrente);
    const formattedStartDate = this.formatDate(formValues.startDate);
    const formattedContractEndDate = this.formatDate(formValues.contractEndDate);


    const logoCloe64 = getBase64Image(this.selectedClient.logo, 'image/png');
    const firmaCloe64 = getBase64Image(this.selectedClient.signature, 'image/png');

    console.log('Logo Base64:', logoCloe64);
    console.log('Signature Base64:', firmaCloe64);

    const logoImg = document.getElementById('logo') as HTMLImageElement;
    const signatureImg = document.getElementById('signature') as HTMLImageElement;

    // Set the base64 image as the src for the img tags
    if (logoImg && signatureImg) {
      logoImg.src = logoCloe64;
      signatureImg.src = firmaCloe64;
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: logoCloe64,
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
                      text: "C L O E S.r.l.s. – Via Almerico da Schio, 8 – Milano",
                      size: 20,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Partita IVA 12640520966",
                      size: 20,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Email cloesrls22@gmail.com – PEC cloesrls22@pec.it",
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
                  text: `Gentile Sig. ${formValues.name} ${formValues.surname}`,
                  size: 24,
                }),
                new TextRun({ text: '', break: 1 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '', break: 1 }),
                new TextRun(`Milano, ${formattedDataCorrente}`),
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
                new TextRun(`- INIZIO DEL RAPPORTO: ${formattedStartDate}`),
                new TextRun({ text: '', break: 1 }),
                new TextRun(`- DURATA E TIPOLOGIA DEL RAPPORTO: Contratto a tempo determinato scadenza in data ${formattedContractEndDate}`),
                new TextRun({ text: '', break: 1 }),
                new TextRun(`- CCNL APPLICATO: Settore ${formValues.sector} a cui appartiene la nostra azienda`),
                new TextRun({ text: '', break: 1 }),
                new TextRun(`- LIVELLO DI INQUADRAMENTO: Sarete inquadrato al ${formValues.level}`),
                new TextRun({ text: '', break: 1 }),
                new TextRun(`- MANSIONI: Le mansioni a Lei affidate saranno le seguenti: “${formValues.duties}”`),
                new TextRun({ text: '', break: 1 }),
                new TextRun(`- ORARIO DI LAVORO: L’orario di lavoro è di ${formValues.workingHours} ore settimanali così distribuito: dal lunedì al venerdì 8 ore giornaliere.`),
                new TextRun({ text: '', break: 1 }),
                new TextRun(`- RETRIBUZIONE: Si fa esplicito riferimento a quanto previsto dal vigente CCNL Edilizia Industria. Si fa inoltre presente che eventuali compensi aggiuntivi alla retribuzione stabilita dal CCNL di categoria, corrisposti come superminimi, potranno essere assorbiti, fino alla loro concorrenza, da qualsiasi aumento contrattuale e non.`),
                new TextRun({ text: '', break: 1 }),
                new TextRun(`- Si riconferma che In conformità a quanto previsto dal Decreto Legislativo 81/2008 e successive modificazioni, il lavoratore si rende edotto che deve prendersi cura della propria sicurezza, della propria salute e di quella delle altre persone presenti sul luogo di lavoro, sui quali possono ricadere gli effetti delle sue azioni e/o omissioni, dichiarandosi edotto altresì che queste ultime sono punibili con le contravvenzioni e le sanzioni disciplinari previste dalla normativa vigente.`),
                new TextRun({ text: '', break: 1 }),
                new TextRun(`- Il sottoscritto ${formValues.name} ${formValues.surname} conferma e dichiara di aver ricevuto completa informativa ai sensi dell'art. 13 del Decreto Regolamento Europeo 2016/679 GDPR ed esprime il consenso al trattamento ed alla comunicazione dei propri dati qualificati come personali del citato decreto con particolare riguardo a quelli cosiddetti sensibili nei limiti, per le finalità e per la durata precisati nell'informativa.`),
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
                              data: firmaCloe64,
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


    Packer.toBlob(doc).then(blob => {
      saveAs(blob, 'LETTERA ASSUNZIONE ' + formValues.name + ' ' + formValues.surname + '.docx');
    });
  }



}


function getBase64Image(bufferArray, mimeType = 'image/png') {
  return `data:${mimeType};base64,${bufferArray}`;
}
