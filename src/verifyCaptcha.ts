const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface TurnstileResponse {
	success: boolean;
	'error-codes'?: string[];
}

export const verifyCaptcha = async ({ token, ip, env }: { token: string; ip: string | null; env: { CF_CAPTCHA_KEY: string } }) => {
	const formData = new FormData();

	formData.append('secret', env.CF_CAPTCHA_KEY);
	formData.append('response', token);
	if (ip) {
		formData.append('remoteip', ip);
	}

	try {
		const result = await fetch(url, {
			body: formData,
			method: 'POST',
		});

		const outcome = await result.json<TurnstileResponse>();

		if (!outcome.success) {
			return false;
		}

		return true;
	} catch (error) {
		return false;
	}
};
