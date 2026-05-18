import AttendanceRuleManager from '../../../components/AttendanceRules/AttendanceRuleManager'
import { hrApi } from '../../../features/hr/api'

function HRWarningLetters() {
    return (
        <AttendanceRuleManager
            pageTitle="Aturan Peringatan Kehadiran Pegawai"
            subtitle="HR mengatur acuan alpha berturut dan akumulasi untuk menentukan eskalasi pelanggaran kehadiran."
            apiClient={hrApi}
        />
    )
}

export default HRWarningLetters

