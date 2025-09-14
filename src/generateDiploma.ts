import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

type DiplomaProps = {
	username: string;
	major: string;
	degree: string;
};

async function generateDiploma({ username, major, degree }: DiplomaProps): Promise<Uint8Array> {
	// Fetch the PDF with form fields from a public URL
	const formUrl = 'https://raw.githubusercontent.com/WildChickenUniversity/WildChickenUniversity/master/public/template_diploma.pdf';
	const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());

	const pdfDoc = await PDFDocument.load(formPdfBytes);
	pdfDoc.registerFontkit(fontkit);

	// Load local fonts using import.meta.url to construct the path
	const chomskyFontUrl = 'https://raw.githubusercontent.com/WildChickenUniversity/WildChickenUniversity/master/public/fonts/Chomsky.ttf';
	const chomskyFontByte = await fetch(chomskyFontUrl).then((res) => res.arrayBuffer());
	const chomskyFont = await pdfDoc.embedFont(chomskyFontByte, { subset: true });

	const sourceHanSerifUrl =
		'https://raw.githubusercontent.com/WildChickenUniversity/WildChickenUniversity/master/public/fonts/NotoSerifSC-Bold.ttf';
	const sourceHanSerifByte = await fetch(sourceHanSerifUrl).then((res) => res.arrayBuffer());
	const sourceHanSerif = await pdfDoc.embedFont(sourceHanSerifByte, { subset: true });

	const englishUnicode = /^[0-9a-zA-Z\s]+$/;

	// Get the form containing all the fields
	const form = pdfDoc.getForm();
	// Get all fields in the PDF by their names
	const majorField = form.getTextField('major');
	const nameField = form.getTextField('name');
	const degreeField = form.getTextField('degree');

	// idiot-proof
	// just please don't enter a super long major name :)
	const widthMajorField = 450;
	const widthDegreeField = 450;
	const widthNameField = 350;
	const widthMajor = major.length * 40;
	const widthName = username.length * 40;
	const widthDegree = degree.length * 40;

	if (widthMajorField < widthMajor) {
		const fontSizeMajor = widthMajorField / major.length;
		majorField.setFontSize(fontSizeMajor);
	}
	if (widthNameField < widthName) {
		const fontSizeName = widthNameField / username.length;
		nameField.setFontSize(fontSizeName);
	}
	if (widthDegreeField < widthDegree) {
		const fontSizeDegree = widthDegreeField / degree.length;
		degreeField.setFontSize(fontSizeDegree);
	}

	// Fill in the name field
	majorField.setText(major);
	nameField.setText(username);
	degreeField.setText(degree);

	majorField.updateAppearances(englishUnicode.test(major) ? chomskyFont : sourceHanSerif);
	nameField.updateAppearances(englishUnicode.test(username) ? chomskyFont : sourceHanSerif);
	degreeField.updateAppearances(englishUnicode.test(degree) ? chomskyFont : sourceHanSerif);

	// Flatten the form fields
	form.flatten();
	// Serialize the PDFDocument to bytes (a Uint8Array)
	const pdfBytes = await pdfDoc.save();

	return pdfBytes;
}

export default generateDiploma;
