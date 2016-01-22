from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
import os

dir = os.getcwd().replace("\\","/")
url = 'file:///%s/index.html' % dir;
driver = webdriver.Firefox()
driver.get(url)
try:
    assert "stroke looper" == driver.title

    canvas = driver.find_element_by_css_selector("#myCanvas")
    dfile = driver.find_element_by_css_selector("#downloadFileLink")
    actions = ActionChains(driver)
    actions.move_to_element(canvas)
    actions.move_by_offset(10, 20)
    actions.click_and_hold(canvas)
    actions.move_by_offset(11, 20)
    actions.move_by_offset(50, 60)
    actions.release()
    actions.move_to_element(dfile)
    actions.click()
    actions.perform()

except AssertionError:
    pass
    driver.close();
    raise
driver.close()
