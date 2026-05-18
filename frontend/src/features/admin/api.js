import axios from 'axios'

const parseApiError = (error, fallbackMessage) => {
    return error?.response?.data?.message || fallbackMessage
}

export const adminApi = {
    async getDashboard() {
        try {
            const response = await axios.get('/api/dashboard/admin')
            return response.data
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat dashboard admin'))
        }
    },

    async getUsers() {
        try {
            const response = await axios.get('/api/auth/admin/users')
            return response.data?.users || []
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat data pengguna'))
        }
    },

    async getMeta() {
        try {
            const response = await axios.get('/api/auth/admin/meta')
            return response.data || { roles: [], positions: [] }
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat data referensi'))
        }
    },

    async createStaff(payload) {
        try {
            const response = await axios.post('/api/auth/register/staff', payload)
            return response.data
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal menambah pengguna'))
        }
    },

    async createDepartment(payload) {
        try {
            const response = await axios.post('/api/departments', payload)
            return response.data
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal menambah departemen'))
        }
    },

    async getDepartments() {
        try {
            const response = await axios.get('/api/departments')
            return response.data?.data || []
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat data departemen'))
        }
    },

    async updateDepartment(departmentId, payload) {
        try {
            const response = await axios.put(`/api/departments/${departmentId}`, payload)
            return response.data
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal mengubah departemen'))
        }
    },

    async deleteDepartment(departmentId) {
        try {
            const response = await axios.delete(`/api/departments/${departmentId}`)
            return response.data
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal menghapus departemen'))
        }
    },

    async createPosition(payload) {
        try {
            const response = await axios.post('/api/positions', payload)
            return response.data
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal menambah posisi'))
        }
    },

    async getPositions() {
        try {
            const response = await axios.get('/api/positions')
            return response.data?.data || []
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat data posisi'))
        }
    },

    async getPositionsByDepartment(departmentId) {
        try {
            const response = await axios.get(`/api/positions/department/${departmentId}`)
            return response.data?.data || []
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat posisi departemen'))
        }
    },

    async updatePosition(positionId, payload) {
        try {
            const response = await axios.put(`/api/positions/${positionId}`, payload)
            return response.data
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal mengubah posisi'))
        }
    },

    async deletePosition(positionId) {
        try {
            const response = await axios.delete(`/api/positions/${positionId}`)
            return response.data
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal menghapus posisi'))
        }
    },

    async updateUser(userId, payload) {
        try {
            const response = await axios.put(`/api/auth/admin/users/${userId}`, payload)
            return response.data
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal mengubah pengguna'))
        }
    },

    async deleteUser(userId) {
        try {
            const response = await axios.delete(`/api/auth/admin/users/${userId}`)
            return response.data
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal menghapus pengguna'))
        }
    },

    async getEmployees() {
        try {
            const response = await axios.get('/api/employees')
            return response.data?.employees || []
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat data pegawai'))
        }
    },

    async getEmployeeById(employeeId) {
        try {
            const response = await axios.get(`/api/employees/${employeeId}`)
            return response.data?.employee || null
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat detail pegawai'))
        }
    },

    async updateEmployee(employeeId, payload) {
        try {
            const response = await axios.put(`/api/employees/${employeeId}`, payload)
            return response.data
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal mengubah data pegawai'))
        }
    },

    async deleteEmployee(employeeId) {
        try {
            const response = await axios.delete(`/api/employees/${employeeId}`)
            return response.data
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal menghapus data pegawai'))
        }
    },

    async getActivityLogs(params = {}) {
        try {
            const response = await axios.get('/api/activity-logs', { params })
            return response.data || { data: [], pagination: {} }
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat log aktivitas'))
        }
    },

    async getActivitySummary(days = 7) {
        try {
            const response = await axios.get('/api/activity-logs/summary', { params: { days } })
            return response.data?.data || { byAction: [], byModule: [], byRole: [] }
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat ringkasan log aktivitas'))
        }
    },

    async getAttendanceRecords(params = {}) {
        try {
            const response = await axios.get('/api/attendance/all', { params })
            return response.data || { data: [] }
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat data kehadiran pegawai'))
        }
    },

    async getAttendanceMembers() {
        try {
            const response = await axios.get('/api/attendance/team-members')
            return response.data || { data: [] }
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat daftar pegawai'))
        }
    },

    async updateAttendanceStatus(id, status) {
        try {
            const response = await axios.put(`/api/attendance/${id}/status`, { status })
            return response.data || {}
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memperbarui status kehadiran'))
        }
    },

    async updateAttendanceTime(id, payload) {
        try {
            const response = await axios.put(`/api/attendance/${id}/time`, payload)
            return response.data || {}
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memperbarui jam kehadiran'))
        }
    },

    async restoreByActivityLog(logId) {
        try {
            const response = await axios.post(`/api/activity-logs/${logId}/restore`)
            return response.data || {}
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memulihkan data dari log aktivitas'))
        }
    },

    async getReimbursements(params = {}) {
        try {
            const response = await axios.get('/api/reimbursements', {
                params: {
                    ...params,
                    roleContext: 'admin',
                    submitterRole: 'atasan',
                },
            })
            return response.data || { data: [] }
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat data reimbursement'))
        }
    },

    async reviewReimbursement(id, action) {
        try {
            const response = await axios.put(`/api/reimbursements/${id}/approve`, { action })
            return response.data || {}
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memproses reimbursement'))
        }
    },

    async getPayrollManagerAdjustments(params = {}) {
        try {
            const response = await axios.get('/api/payroll/manager-adjustments', { params })
            return response.data || { data: [] }
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat adjustment payroll atasan'))
        }
    },

    async upsertPayrollManagerAdjustment(payload) {
        try {
            const response = await axios.post('/api/payroll/manager-adjustments/upsert', payload)
            return response.data || {}
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal menyimpan adjustment payroll atasan'))
        }
    },

    async approvePayrollManagerAdjustment(adjustmentId) {
        try {
            const response = await axios.put(`/api/payroll/manager-adjustments/${adjustmentId}/approve`)
            return response.data || {}
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal menyetujui adjustment payroll'))
        }
    },

    async rejectPayrollManagerAdjustment(adjustmentId, reason = '') {
        try {
            const response = await axios.put(`/api/payroll/manager-adjustments/${adjustmentId}/reject`, { reason })
            return response.data || {}
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal menolak adjustment payroll'))
        }
    },

    async getWarningLetterEligibleEmployees() {
        try {
            const response = await axios.get('/api/warning-letters/eligible-employees')
            return response.data || { data: [] }
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat kandidat surat peringatan'))
        }
    },

    async getAttendanceWarningRules(params = {}) {
        try {
            const response = await axios.get('/api/attendance-warning-rules', { params })
            return response.data || { data: [] }
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat aturan peringatan kehadiran'))
        }
    },

    async createAttendanceWarningRule(payload) {
        try {
            const response = await axios.post('/api/attendance-warning-rules', payload)
            return response.data || {}
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal membuat aturan peringatan kehadiran'))
        }
    },

    async updateAttendanceWarningRule(ruleId, payload) {
        try {
            const response = await axios.put(`/api/attendance-warning-rules/${ruleId}`, payload)
            return response.data || {}
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memperbarui aturan peringatan kehadiran'))
        }
    },

    async deleteAttendanceWarningRule(ruleId) {
        try {
            const response = await axios.delete(`/api/attendance-warning-rules/${ruleId}`)
            return response.data || {}
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal menghapus aturan peringatan kehadiran'))
        }
    },

    async getWarningLetters(params = {}) {
        try {
            const response = await axios.get('/api/warning-letters', { params })
            return response.data || { data: [] }
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal memuat data surat peringatan'))
        }
    },

    async createWarningLetter(payload) {
        try {
            const response = await axios.post('/api/warning-letters', payload)
            return response.data || {}
        } catch (error) {
            throw new Error(parseApiError(error, 'Gagal membuat surat peringatan'))
        }
    },
}
