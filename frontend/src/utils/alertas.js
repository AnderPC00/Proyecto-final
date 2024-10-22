import Swal from 'sweetalert2';

export const showSuccessMessage = (message) => {
    Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: message,
        confirmButtonText: 'OK'
    });
};

export const showErrorMessage = (message) => {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'OK'
    });
};