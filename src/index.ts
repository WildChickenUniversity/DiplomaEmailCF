import { Buffer } from 'buffer';
import { Resend } from 'resend';
import generateDiploma from './generateDiploma';

interface Env {
	RESEND_API_KEY: string;
}

interface RequestBody {
	email: string;
	username: string;
	major: string;
	degree: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405 });
		}

		const resend = new Resend(env.RESEND_API_KEY);

		try {
			// Parse request body
			const requestBody = (await request.json()) as RequestBody;
			const { email, username, major, degree } = requestBody;

			if (!email || !username || !major || !degree) {
				return new Response('Missing required fields: email, username, major, degree', { status: 400 });
			}

			const subject = 'Your Wild Chicken University Diploma';

			const currentDate = new Date();
			const currentYear = currentDate.getFullYear();

			const content = `
    <p>
      Dear ${username},
    </p>
    <p>
      Please find attached a copy of your diploma for your records.
      <ul>
        <li>Name: ${username}</li>
        <li>Degree: ${degree}</li>
        <li>Year of Graduation: ${currentYear}</li>
      </ul>
    </p>
    <p>
      Should you require any additional documentation or verification, 
      please go to our <a href="https://wcu.edu.pl">official website</a>
    </p>
    <p>
      Squawk Squawk
    </p>
    `;

			const pdfBytes = await generateDiploma({ username, major, degree });

			const { data, error } = await resend.emails.send({
				from: 'chicken@registrar.wcu.edu.pl',
				to: email,
				subject: subject,
				html: content,
				attachments: [
					{
						filename: `WCU_Diploma_${username.split(' ').join('_')}.pdf`,
						content: Buffer.from(pdfBytes),
					},
				],
			});

			if (error) {
				console.error('Resend error:', JSON.stringify(error));
				return new Response(`Failed to send email: ${error.message}`, { status: 500 });
			}

			return Response.json(data);
		} catch (e) {
			const error = e as Error;
			console.error('Fetch handler error:', error.stack);
			return new Response(error.message, { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;
