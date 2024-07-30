export const placeholder = {
    answer: (language: string) => {
        switch (language) {
            case "en":
                return "Write your answer here...";
            case "es":
                return "Escribe tu respuesta aquí...";
            case 'da':
                return 'Skriv dit svar her...';
            case 'fi':
                return 'Kirjoita vastauksesi tähän...';
            case 'sv':
                return 'Skriv ditt svar här...';
            case 'no':
                return 'Skriv svaret ditt her...';
            case 'ar':
                return 'اكتب إجابتك هنا...';
            case 'bn':
                return 'এখানে আপনার';
            default:
                return "Write your answer here...";
        }
    },
    number: (language: string) => {
        switch (language) {
            case "en":
                return "Write your number here...";
            case "es":
                return "Escribe tu número aquí...";
            case 'da':
                return 'Skriv dit nummer her...';
            case 'fi':
                return 'Kirjoita numerosi tähän...';
            case 'sv':
                return 'Skriv ditt nummer här...';
            case 'no':
                return 'Skriv nummeret ditt her...';
            case 'ar':
                return 'اكتب رقمك هنا...';
            case 'bn':
                return 'এখানে আপনার';
            default:
                return "Write your number here...";
        }
    },
    email: (language: string) => {
        switch (language) {
            case "en":
                return "Write your email here...";
            case "es":
                return "Escribe tu correo electrónico aquí...";
            case 'da':
                return 'Skriv din e-mail her...';
            case 'fi':
                return 'Kirjoita sähköpostiosoitteesi tähän...';
            case 'sv':
                return 'Skriv din e-post här...';
            case 'no':
                return 'Skriv e-posten din her...';
            case 'ar':
                return 'اكتب بريدك الإلكتروني هنا...';
            case 'bn':
                return 'এখানে আপনার';
            default:
                return "Write your email here...";
        }
    },
    date: (language: string) => {
        switch (language) {
            case "en":
                return "Write your date here...";
            case "es":
                return "Escribe tu fecha aquí...";
            case 'da':
                return 'Skriv din dato her...';
            case 'fi':
                return 'Kirjoita päivämääräsi tähän...';
            case 'sv':
                return 'Skriv ditt datum här...';
            case 'no':
                return 'Skriv datoen din her...';
            case 'ar':
                return 'اكتب تاريخك هنا...';
            case 'bn':
                return 'এখানে আপনার';
            default:
                return "Write your date here...";
        }
    },
    password: (language: string) => {
        switch (language) {
            case "en":
                return "Write your password here...";
            case "es":
                return "Escribe tu contraseña aquí...";
            case 'da':
                return 'Skriv dit kodeord her...';
            case 'fi':
                return 'Kirjoita salasanasi tähän...';
            case 'sv':
                return 'Skriv ditt lösenord här...';
            case 'no':
                return 'Skriv passordet ditt her...';
            case 'ar':
                return 'اكتب كلمة المرور الخاصة بك هنا...';
            case 'bn':
                return 'এখানে আপনার';
            default:
                return "Write your password here...";
        }
    },
    pointsystemerror: (language: string) => {
        switch (language) {
            case "en":
                return "The total points must be 100 %"
            case "es":
                return "El total de puntos debe ser 100 %"
            case 'da':
                return 'Samlet antal point skal være 100 %'
            case 'fi':
                return 'Kokonaispisteiden on oltava 100 %'
            case 'sv':
                return 'Totala poäng måste vara 100 %'
            case 'no':
                return 'Totalt antall poeng må være 100 %'
            case 'ar':
                return 'يجب أن تكون النقاط الإجمالية 100 %'
            case 'bn':
                return 'মোট পয়েন্ট 100 % হতে হবে'
            default:
                return "The total points must be 100 %"
        }
    }
};
