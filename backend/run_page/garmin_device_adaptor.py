from fit_tool.fit_file import FitFile
from fit_tool.fit_file_builder import FitFileBuilder
from fit_tool.profile.messages.device_info_message import DeviceInfoMessage
from fit_tool.profile.messages.record_message import RecordMessage


def process_garmin_data(file_obj, use_fake_garmin_device=False):
    # passthrough for now; device injection can be added if needed
    return file_obj
